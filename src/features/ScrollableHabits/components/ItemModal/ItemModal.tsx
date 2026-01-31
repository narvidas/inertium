import { Ionicons } from "@expo/vector-icons";
import { Button, H3, Input, Item, Label, Root, Text } from "../../../../ui";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text as RNText,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { errorToast } from "../../../../utils/toast";
import { Item as ItemType } from "../../types";
import { styles, markdownStyles } from "./ItemModal.styles";

type Values = Partial<ItemType>;

interface Props {
  visible: boolean;
  defaultValues: Values;
  /** Optional markdown template to pre-populate empty notes */
  noteTemplate?: string;
  onSave: (notes: string) => void;
  onClose: () => void;
}

const MAX_NOTES_LENGTH = 1000;

// Regex to find checkbox patterns: - [ ] or - [x] or - [X]
const CHECKBOX_UNCHECKED = /^(\s*[-*]\s*)\[ \]/;
const CHECKBOX_CHECKED = /^(\s*[-*]\s*)\[[xX]\]/;

/**
 * Toggle a checkbox at a specific line in the markdown text.
 * Finds the nth checkbox occurrence and toggles its state.
 */
const toggleCheckbox = (text: string, checkboxIndex: number): string => {
  const lines = text.split("\n");
  let currentIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (CHECKBOX_UNCHECKED.test(line) || CHECKBOX_CHECKED.test(line)) {
      if (currentIndex === checkboxIndex) {
        // Toggle this checkbox
        if (CHECKBOX_UNCHECKED.test(line)) {
          lines[i] = line.replace("[ ]", "[x]");
        } else {
          lines[i] = line.replace(/\[[xX]\]/, "[ ]");
        }
        break;
      }
      currentIndex++;
    }
  }

  return lines.join("\n");
};

/**
 * Pre-process markdown to convert checkbox syntax to visual indicators.
 * Returns processed text and checkbox positions for interactivity.
 */
const processCheckboxes = (text: string): { line: string; isCheckbox: boolean; checked: boolean }[] => {
  return text.split("\n").map((line) => {
    if (CHECKBOX_CHECKED.test(line)) {
      return { line, isCheckbox: true, checked: true };
    }
    if (CHECKBOX_UNCHECKED.test(line)) {
      return { line, isCheckbox: true, checked: false };
    }
    return { line, isCheckbox: false, checked: false };
  });
};

export const ItemModal: FC<Props> = ({ visible, defaultValues, noteTemplate, onSave, onClose }) => {
  // Determine initial notes value - use template if notes are empty
  const initialNotes = useMemo(() => {
    if (defaultValues.notes && defaultValues.notes.trim() !== "") {
      return defaultValues.notes;
    }
    return noteTemplate || "";
  }, [defaultValues.notes, noteTemplate]);

  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // Reset notes when modal opens with new values
  useEffect(() => {
    if (visible) {
      const newNotes =
        defaultValues.notes && defaultValues.notes.trim() !== ""
          ? defaultValues.notes
          : noteTemplate || "";
      setNotes(newNotes);
      // Start in view mode if there's content, edit mode if empty
      setIsEditing(!newNotes);
    }
  }, [visible, defaultValues.notes, noteTemplate]);

  useEffect(() => {
    if (error) errorToast(error);
  }, [error]);

  const handleNotesChange = useCallback((text: string) => {
    if (text.length <= MAX_NOTES_LENGTH) {
      setNotes(text);
      setError(undefined);
    } else {
      setError(`Cannot exceed ${MAX_NOTES_LENGTH} characters`);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (notes.length > MAX_NOTES_LENGTH) {
      setError(`Cannot exceed ${MAX_NOTES_LENGTH} characters`);
      return;
    }
    onSave(notes);
    onClose();
  }, [notes, onSave, onClose]);

  const handleToggleEdit = useCallback(() => {
    setIsEditing((prev) => !prev);
    Keyboard.dismiss();
  }, []);

  // Handle checkbox toggle in view mode
  const handleCheckboxToggle = useCallback(
    (checkboxIndex: number) => {
      const newNotes = toggleCheckbox(notes, checkboxIndex);
      setNotes(newNotes);
    },
    [notes],
  );

  const hasContent = notes.trim().length > 0;

  // Process markdown for checkbox rendering
  const processedLines = useMemo(() => processCheckboxes(notes), [notes]);
  const hasCheckboxes = processedLines.some((l) => l.isCheckbox);

  // Render markdown with interactive checkboxes
  const renderMarkdownWithCheckboxes = useCallback(() => {
    let checkboxIndex = 0;

    return processedLines.map((lineData, lineIndex) => {
      if (lineData.isCheckbox) {
        const currentCheckboxIndex = checkboxIndex;
        checkboxIndex++;

        // Extract the text after the checkbox syntax
        const textContent = lineData.line
          .replace(CHECKBOX_CHECKED, "$1")
          .replace(CHECKBOX_UNCHECKED, "$1")
          .replace(/^\s*[-*]\s*/, "");

        return (
          <TouchableOpacity
            key={lineIndex}
            style={styles.checkboxRow}
            onPress={() => handleCheckboxToggle(currentCheckboxIndex)}
            activeOpacity={0.6}
          >
            <RNText style={styles.checkboxIcon}>{lineData.checked ? "✅" : "⬜"}</RNText>
            <RNText
              style={[styles.checkboxText, lineData.checked && styles.checkboxTextChecked]}
            >
              {textContent}
            </RNText>
          </TouchableOpacity>
        );
      }

      // For non-checkbox lines, render with Markdown
      if (lineData.line.trim()) {
        return (
          <Markdown key={lineIndex} style={markdownStyles}>
            {lineData.line}
          </Markdown>
        );
      }

      // Empty lines - add spacing
      return <View key={lineIndex} style={{ height: 8 }} />;
    });
  }, [processedLines, handleCheckboxToggle]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Root>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <View>
                <H3>Update Item</H3>
              </View>
              <View style={styles.inputContainer}>
                <Item>
                  <View style={styles.labelRow}>
                    <Label>Notes:</Label>
                    {hasContent && (
                      <TouchableOpacity
                        onPress={handleToggleEdit}
                        style={styles.modeToggle}
                        accessibilityLabel={isEditing ? "preview notes" : "edit notes"}
                      >
                        <Ionicons
                          name={isEditing ? "eye-outline" : "pencil"}
                          size={18}
                          color="#5A9C5E"
                        />
                        <RNText style={styles.modeToggleText}>
                          {isEditing ? "Preview" : "Edit"}
                        </RNText>
                      </TouchableOpacity>
                    )}
                  </View>
                  {isEditing ? (
                    <Input
                      style={styles.input}
                      onChangeText={handleNotesChange}
                      accessibilityLabel="change item notes"
                      name="notes"
                      multiline
                      lines={15}
                      value={notes}
                      autoGrow
                      autoFocus={!hasContent}
                      placeholder="Add notes (supports markdown)&#10;&#10;Checklist example:&#10;- [ ] Item 1&#10;- [x] Item 2 (checked)"
                    />
                  ) : (
                    <View style={styles.markdownContainer}>
                      <ScrollView style={styles.markdownScroll} nestedScrollEnabled>
                        {hasCheckboxes ? (
                          renderMarkdownWithCheckboxes()
                        ) : (
                          <Markdown style={markdownStyles}>{notes}</Markdown>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </Item>
              </View>
              <View style={styles.buttonContainer}>
                <View style={{ marginRight: 10 }}>
                  <Button onPress={handleSubmit} success>
                    <Ionicons name="checkmark" style={styles.buttonIcon} />
                    <Text>Save</Text>
                  </Button>
                </View>
                <View>
                  <Button onPress={onClose} secondary>
                    <Ionicons name="close" style={styles.buttonIcon} />
                    <Text>Close</Text>
                  </Button>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Root>
    </Modal>
  );
};


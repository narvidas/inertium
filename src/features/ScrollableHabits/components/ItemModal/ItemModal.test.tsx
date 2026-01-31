import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { ItemModal } from "./ItemModal";

// Mock the toast utility
jest.mock("../../../../utils/toast", () => ({
  errorToast: jest.fn(),
}));

// Mock react-native-markdown-display
jest.mock("react-native-markdown-display", () => {
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: string }) => <Text>{children}</Text>,
  };
});

describe("ItemModal", () => {
  const defaultProps = {
    visible: true,
    defaultValues: { notes: "" },
    onSave: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders when visible", () => {
      const { getByText } = render(<ItemModal {...defaultProps} />);
      expect(getByText("Update Item")).toBeTruthy();
      expect(getByText("Notes:")).toBeTruthy();
    });

    it("does not render when not visible", () => {
      const { queryByText } = render(<ItemModal {...defaultProps} visible={false} />);
      expect(queryByText("Update Item")).toBeNull();
    });

    it("renders Save and Close buttons", () => {
      const { getByText } = render(<ItemModal {...defaultProps} />);
      expect(getByText("Save")).toBeTruthy();
      expect(getByText("Close")).toBeTruthy();
    });
  });

  describe("Note Template", () => {
    it("pre-populates with template when notes are empty", () => {
      const template = "## Workout\n- [ ] Squats";
      const { getByText } = render(
        <ItemModal {...defaultProps} noteTemplate={template} />
      );
      // Template content should be rendered (in preview mode)
      expect(getByText(/Workout/)).toBeTruthy();
    });

    it("uses existing notes over template", () => {
      const template = "## Template";
      const existingNotes = "My existing notes";
      const { getByText, queryByText } = render(
        <ItemModal
          {...defaultProps}
          defaultValues={{ notes: existingNotes }}
          noteTemplate={template}
        />
      );
      expect(getByText(existingNotes)).toBeTruthy();
      expect(queryByText("Template")).toBeNull();
    });

    it("starts in edit mode when notes are empty and no template", () => {
      const { getByLabelText } = render(<ItemModal {...defaultProps} />);
      // Should show input field (edit mode)
      expect(getByLabelText("change item notes")).toBeTruthy();
    });

    it("starts in preview mode when there is content", () => {
      const { getByLabelText, getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: "Some content" }} />
      );
      // Should show Edit button (preview mode)
      expect(getByLabelText("edit notes")).toBeTruthy();
      expect(getByText("Edit")).toBeTruthy();
    });
  });

  describe("Edit/Preview Toggle", () => {
    it("toggles from preview to edit mode", () => {
      const { getByLabelText, getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: "Some content" }} />
      );

      // Initially in preview mode
      expect(getByText("Edit")).toBeTruthy();

      // Click to switch to edit
      fireEvent.press(getByLabelText("edit notes"));

      // Now in edit mode
      expect(getByText("Preview")).toBeTruthy();
      expect(getByLabelText("change item notes")).toBeTruthy();
    });

    it("toggles from edit to preview mode", () => {
      const { getByLabelText, getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: "Some content" }} />
      );

      // Switch to edit mode first
      fireEvent.press(getByLabelText("edit notes"));
      expect(getByText("Preview")).toBeTruthy();

      // Switch back to preview
      fireEvent.press(getByLabelText("preview notes"));
      expect(getByText("Edit")).toBeTruthy();
    });
  });

  describe("Checkbox Functionality", () => {
    it("renders checkboxes with correct icons", () => {
      const notesWithCheckboxes = "- [ ] Unchecked\n- [x] Checked";
      const { getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: notesWithCheckboxes }} />
      );

      expect(getByText("⬜")).toBeTruthy();
      expect(getByText("✅")).toBeTruthy();
    });

    it("toggles checkbox from unchecked to checked", async () => {
      const notesWithCheckbox = "- [ ] Task";
      const { getByText, queryByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: notesWithCheckbox }} />
      );

      // Initially unchecked
      expect(getByText("⬜")).toBeTruthy();

      // Click the checkbox
      fireEvent.press(getByText("⬜"));

      // Should now be checked
      await waitFor(() => {
        expect(getByText("✅")).toBeTruthy();
        expect(queryByText("⬜")).toBeNull();
      });
    });

    it("toggles checkbox from checked to unchecked", async () => {
      const notesWithCheckbox = "- [x] Completed task";
      const { getByText, queryByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: notesWithCheckbox }} />
      );

      // Initially checked
      expect(getByText("✅")).toBeTruthy();

      // Click the checkbox
      fireEvent.press(getByText("✅"));

      // Should now be unchecked
      await waitFor(() => {
        expect(getByText("⬜")).toBeTruthy();
        expect(queryByText("✅")).toBeNull();
      });
    });

    it("renders checkbox text with strikethrough when checked", () => {
      const notesWithCheckbox = "- [x] Done task";
      const { getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: notesWithCheckbox }} />
      );

      const taskText = getByText("Done task");
      expect(taskText.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ textDecorationLine: "line-through" }),
        ])
      );
    });
  });

  describe("Save and Close", () => {
    it("calls onSave with notes content when Save is pressed", () => {
      const onSave = jest.fn();
      const { getByText, getByLabelText } = render(
        <ItemModal {...defaultProps} onSave={onSave} />
      );

      // Enter some text
      const input = getByLabelText("change item notes");
      fireEvent.changeText(input, "My notes");

      // Press Save
      fireEvent.press(getByText("Save"));

      expect(onSave).toHaveBeenCalledWith("My notes");
    });

    it("calls onClose when Save is pressed", () => {
      const onClose = jest.fn();
      const { getByText } = render(<ItemModal {...defaultProps} onClose={onClose} />);

      fireEvent.press(getByText("Save"));

      expect(onClose).toHaveBeenCalled();
    });

    it("calls onClose when Close is pressed", () => {
      const onClose = jest.fn();
      const { getByText } = render(<ItemModal {...defaultProps} onClose={onClose} />);

      fireEvent.press(getByText("Close"));

      expect(onClose).toHaveBeenCalled();
    });

    it("saves checkbox state changes", async () => {
      const onSave = jest.fn();
      const notesWithCheckbox = "- [ ] Task";
      const { getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: notesWithCheckbox }} onSave={onSave} />
      );

      // Toggle checkbox
      fireEvent.press(getByText("⬜"));

      // Save
      await waitFor(() => {
        fireEvent.press(getByText("Save"));
      });

      // Should save with checkbox toggled
      expect(onSave).toHaveBeenCalledWith("- [x] Task");
    });
  });

  describe("Character Limit", () => {
    it("allows text up to 1000 characters", () => {
      const { getByLabelText } = render(<ItemModal {...defaultProps} />);

      const input = getByLabelText("change item notes");
      const longText = "a".repeat(1000);
      fireEvent.changeText(input, longText);

      expect(input.props.value).toBe(longText);
    });

    it("prevents text exceeding 1000 characters", () => {
      const { errorToast } = require("../../../../utils/toast");
      const { getByLabelText } = render(<ItemModal {...defaultProps} />);

      const input = getByLabelText("change item notes");
      const tooLongText = "a".repeat(1001);
      fireEvent.changeText(input, tooLongText);

      // Should show error toast
      expect(errorToast).toHaveBeenCalledWith("Cannot exceed 1000 characters");
    });
  });

  describe("Markdown Rendering", () => {
    it("renders plain text without checkboxes using Markdown component", () => {
      const { getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: "# Heading\nParagraph text" }} />
      );

      // Content should be rendered
      expect(getByText(/Heading/)).toBeTruthy();
    });

    it("renders mixed content with checkboxes and markdown", () => {
      const mixedContent = "# Title\n- [ ] Task 1\nSome text";
      const { getByText } = render(
        <ItemModal {...defaultProps} defaultValues={{ notes: mixedContent }} />
      );

      expect(getByText(/Title/)).toBeTruthy();
      expect(getByText("⬜")).toBeTruthy();
      expect(getByText(/Some text/)).toBeTruthy();
    });
  });
});

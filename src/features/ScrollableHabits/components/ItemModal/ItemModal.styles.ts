import { Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingTop: 120,
    paddingBottom: 20,
  },
  buttonIcon: {
    fontSize: 20,
    height: 20,
    color: "white",
  },
  buttonContainer: {
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  input: {
    marginBottom: 0,
    minHeight: height * 0.45,
    fontSize: 15,
  },
  inputContainer: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 4,
    width: "100%",
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  modeToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  modeToggleText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#5A9C5E",
    fontWeight: "500",
  },
  markdownContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#fafafa",
    minHeight: height * 0.45,
  },
  markdownScroll: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 4,
  },
  checkboxIcon: {
    fontSize: 18,
    marginRight: 8,
    lineHeight: 22,
  },
  checkboxText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
  },
  checkboxTextChecked: {
    textDecorationLine: "line-through",
    color: "#888",
  },
});

// Markdown-specific styles for the renderer
export const markdownStyles = StyleSheet.create({
  body: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  heading1: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 8,
    color: "#222",
  },
  heading2: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 6,
    color: "#333",
  },
  heading3: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 4,
    color: "#444",
  },
  bullet_list: {
    marginLeft: 8,
  },
  ordered_list: {
    marginLeft: 8,
  },
  list_item: {
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: "#e8e8e8",
    borderRadius: 4,
    paddingHorizontal: 4,
    fontFamily: "monospace",
    fontSize: 13,
  },
  code_block: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 10,
    fontFamily: "monospace",
    fontSize: 13,
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  th: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    fontWeight: "bold",
  },
  td: {
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#5A9C5E",
    paddingLeft: 12,
    marginLeft: 0,
    opacity: 0.8,
  },
  hr: {
    backgroundColor: "#ddd",
    height: 1,
    marginVertical: 12,
  },
  strong: {
    fontWeight: "bold",
  },
  em: {
    fontStyle: "italic",
  },
  link: {
    color: "#5A9C5E",
    textDecorationLine: "underline",
  },
});

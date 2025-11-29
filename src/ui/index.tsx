/**
 * UI Component Library
 *
 * Drop-in replacements for native-base components using React Native + NativeWind.
 * Maintains similar API for minimal migration effort.
 */

import React, { FC, ReactNode, createContext, useContext, useRef, useCallback } from "react";
import {
  View as RNView,
  Text as RNText,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  ViewProps,
  TouchableOpacityProps,
  Animated,
  Dimensions,
} from "react-native";

// ============================================================================
// Layout Components
// ============================================================================

interface ContainerProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Container: FC<ContainerProps> = ({ children, style }) => (
  <RNView style={[styles.container, style]}>{children}</RNView>
);

interface ContentProps {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
}

export const Content: FC<ContentProps> = ({ children, contentContainerStyle, style }) => (
  <ScrollView
    style={[styles.content, style]}
    contentContainerStyle={contentContainerStyle}
    keyboardShouldPersistTaps="handled"
  >
    {children}
  </ScrollView>
);

interface CustomViewProps extends ViewProps {
  children?: ReactNode;
}

export const View: FC<CustomViewProps> = ({ children, style, ...props }) => (
  <RNView style={style} {...props}>
    {children}
  </RNView>
);

// Root provides Toast context
export const Root: FC<{ children: ReactNode; testID?: string }> = ({ children, testID }) => (
  <ToastProvider testID={testID}>{children}</ToastProvider>
);

// StyleProvider is no longer needed - we use NativeWind/Tailwind now
export const StyleProvider: FC<{ children: ReactNode; style?: any }> = ({ children }) => <>{children}</>;

// ============================================================================
// Typography
// ============================================================================

interface TextProps {
  children?: ReactNode;
  style?: TextStyle;
}

export const Text: FC<TextProps> = ({ children, style }) => (
  <RNText style={[styles.text, style]}>{children}</RNText>
);

export const H1: FC<TextProps> = ({ children, style }) => (
  <RNText style={[styles.h1, style]}>{children}</RNText>
);

export const H3: FC<TextProps> = ({ children, style }) => (
  <RNText style={[styles.h3, style]}>{children}</RNText>
);

// ============================================================================
// Form Components
// ============================================================================

export const Form: FC<{ children: ReactNode }> = ({ children }) => (
  <RNView style={styles.form}>{children}</RNView>
);

interface ItemProps {
  children: ReactNode;
  stackedLabel?: boolean;
  style?: ViewStyle;
}

export const Item: FC<ItemProps> = ({ children, stackedLabel, style }) => (
  <RNView style={[styles.item, stackedLabel && styles.itemStacked, style]}>{children}</RNView>
);

interface LabelProps {
  children: ReactNode;
  style?: TextStyle;
}

export const Label: FC<LabelProps> = ({ children, style }) => (
  <RNText style={[styles.label, style]}>{children}</RNText>
);

interface InputProps extends TextInputProps {
  style?: TextStyle;
}

export const Input: FC<InputProps> = ({ style, ...props }) => (
  <TextInput style={[styles.input, style]} placeholderTextColor="#999" {...props} />
);

interface ButtonProps extends TouchableOpacityProps {
  children: ReactNode;
  block?: boolean;
  transparent?: boolean;
  danger?: boolean;
  success?: boolean;
  secondary?: boolean;
  style?: ViewStyle;
}

export const Button: FC<ButtonProps> = ({ children, block, transparent, danger, success, secondary, style, ...props }) => (
  <TouchableOpacity
    style={[
      styles.button,
      block && styles.buttonBlock,
      transparent && styles.buttonTransparent,
      danger && styles.buttonDanger,
      success && styles.buttonSuccess,
      secondary && styles.buttonSecondary,
      style,
    ]}
    {...props}
  >
    {React.Children.map(children, child => {
      if (React.isValidElement(child) && child.type === Text) {
        return React.cloneElement(child as React.ReactElement<TextProps>, {
          style: [styles.buttonText, transparent && styles.buttonTextTransparent, danger && styles.buttonTextDanger],
        });
      }
      return child;
    })}
  </TouchableOpacity>
);

// ============================================================================
// List Components
// ============================================================================

interface ListProps {
  children?: ReactNode;
  dataArray?: any[];
  horizontal?: boolean;
  scrollEnabled?: boolean;
  removeClippedSubviews?: boolean;
  style?: ViewStyle;
  renderRow?: (item: any, index: number) => ReactNode;
}

export const List: FC<ListProps> = ({
  children,
  dataArray,
  horizontal,
  scrollEnabled = true,
  style,
  renderRow,
}) => {
  if (dataArray && renderRow) {
    return (
      <FlatList
        data={dataArray}
        horizontal={horizontal}
        scrollEnabled={scrollEnabled}
        style={style}
        renderItem={({ item, index }) => renderRow(item, index)}
        keyExtractor={(item, index) => item.id || index.toString()}
      />
    );
  }

  return (
    <RNView style={[styles.list, horizontal && styles.listHorizontal, style]}>
      {children}
    </RNView>
  );
};

interface ListItemProps extends TouchableOpacityProps {
  children: ReactNode;
  icon?: boolean;
  style?: ViewStyle;
}

export const ListItem: FC<ListItemProps> = ({ children, icon, style, onPress, ...props }) => {
  const Wrapper = onPress ? TouchableOpacity : RNView;
  return (
    <Wrapper
      style={[styles.listItem, icon && styles.listItemIcon, style]}
      onPress={onPress}
      {...(onPress ? props : {})}
    >
      {children}
    </Wrapper>
  );
};

export const Left: FC<{ children: ReactNode }> = ({ children }) => (
  <RNView style={styles.left}>{children}</RNView>
);

export const Body: FC<{ children: ReactNode }> = ({ children }) => (
  <RNView style={styles.body}>{children}</RNView>
);

export const Right: FC<{ children: ReactNode }> = ({ children }) => (
  <RNView style={styles.right}>{children}</RNView>
);

// ============================================================================
// CheckBox
// ============================================================================

interface CheckBoxProps {
  checked?: boolean;
  onPress?: (value: any) => void;
  name?: string;
}

export const CheckBox: FC<CheckBoxProps> = ({ checked, onPress, name }) => (
  <TouchableOpacity
    style={[styles.checkbox, checked && styles.checkboxChecked]}
    onPress={() => onPress && onPress(!checked)}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
  >
    {checked && <RNText style={styles.checkboxCheck}>✓</RNText>}
  </TouchableOpacity>
);

// ============================================================================
// Toast
// ============================================================================

interface ToastConfig {
  text: string;
  duration?: number;
  type?: "success" | "danger" | "warning";
  buttonText?: string;
}

interface ToastContextValue {
  show: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ToastProvider: FC<{ children: ReactNode; testID?: string }> = ({ children, testID }) => {
  const [toast, setToast] = React.useState<ToastConfig | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((config: ToastConfig) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setToast(config);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setToast(null));
    }, config.duration || 3000);
  }, [fadeAnim]);

  // Register toast context on mount
  React.useEffect(() => {
    Toast._setRef({ show });
    return () => Toast._setRef(null);
  }, [show]);

  return (
    <ToastContext.Provider value={{ show }}>
      <RNView style={{ flex: 1 }} testID={testID}>
        {children}
        {toast && (
          <Animated.View
            style={[
              styles.toast,
              toast.type === "success" && styles.toastSuccess,
              toast.type === "danger" && styles.toastDanger,
              toast.type === "warning" && styles.toastWarning,
              { opacity: fadeAnim },
            ]}
          >
            <RNText style={styles.toastText}>{toast.text}</RNText>
            {toast.buttonText && (
              <TouchableOpacity
                onPress={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                  }).start(() => setToast(null));
                }}
              >
                <RNText style={styles.toastButton}>{toast.buttonText}</RNText>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}
      </RNView>
    </ToastContext.Provider>
  );
};

// Static Toast API for compatibility with native-base
let toastRef: ToastContextValue | null = null;

export const Toast = {
  show: (config: ToastConfig) => {
    if (toastRef) {
      toastRef.show(config);
    } else {
      console.warn("Toast: Root component not mounted. Wrap your app with <Root>.");
    }
  },
  _setRef: (ref: ToastContextValue | null) => {
    toastRef = ref;
  },
};

// Hook to register toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  React.useEffect(() => {
    if (context) {
      Toast._setRef(context);
    }
    return () => Toast._setRef(null);
  }, [context]);
  return context;
};

// Modified Root to register toast
export const RootWithToast: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      <ToastContextRegistrar>{children}</ToastContextRegistrar>
    </ToastProvider>
  );
};

const ToastContextRegistrar: FC<{ children: ReactNode }> = ({ children }) => {
  useToastContext();
  return <>{children}</>;
};

// ============================================================================
// Styles
// ============================================================================

const { width: screenWidth } = Dimensions.get("window");

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },

  // Typography
  text: {
    fontSize: 16,
    color: "#333",
  },
  h1: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },

  // Form
  form: {
    paddingHorizontal: 16,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  itemStacked: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
    width: "100%",
  },

  // Button
  button: {
    backgroundColor: "#5A9C5E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    gap: 6,
  },
  buttonBlock: {
    width: "100%",
  },
  buttonTransparent: {
    backgroundColor: "transparent",
  },
  buttonDanger: {
    backgroundColor: "#dc3545",
  },
  buttonSuccess: {
    backgroundColor: "#5A9C5E",
  },
  buttonSecondary: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonTextTransparent: {
    color: "#5A9C5E",
  },
  buttonTextDanger: {
    color: "#fff",
  },

  // List
  list: {
    flexDirection: "column",
  },
  listHorizontal: {
    flexDirection: "row",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemIcon: {
    paddingLeft: 8,
  },
  left: {
    marginRight: 16,
  },
  body: {
    flex: 1,
  },
  right: {
    marginLeft: 16,
  },

  // CheckBox
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#5A9C5E",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: "#5A9C5E",
  },
  checkboxCheck: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Toast
  toast: {
    position: "absolute",
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  toastSuccess: {
    backgroundColor: "#28a745",
  },
  toastDanger: {
    backgroundColor: "#dc3545",
  },
  toastWarning: {
    backgroundColor: "#ffc107",
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  toastButton: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 16,
  },
});

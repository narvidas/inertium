// Theme colors
const Colors = {
  brandPrimary: "#5A9C5E",
  textColor: "#333",
  fontSizeBase: 16,
};

export default {
  navbarProps: {
    navigationBarStyle: { backgroundColor: "white" },
    titleStyle: {
      color: Colors.textColor,
      alignSelf: "center",
      letterSpacing: 2,
      fontSize: Colors.fontSizeBase,
    },
    backButtonTintColor: Colors.textColor,
  },

  tabProps: {
    swipeEnabled: false,
    activeBackgroundColor: "rgba(255,255,255,0.1)",
    inactiveBackgroundColor: Colors.brandPrimary,
    tabBarStyle: { backgroundColor: Colors.brandPrimary },
  },

  icons: {
    style: { color: "white" },
  },
};

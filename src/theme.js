// src/theme.js

const theme = {
  colors: {
    background: "#F3F3F3",
    text: "#121212",
    primaryRed: "#BD1A28",
    primaryBlue: "#0099CD",
    primaryYellow: "#CB9600",
    primaryGreen: "#03a23a",
    card: "#FFFFFF",
    border: "#D1D5DB",

    btnPrimary: "#0099CD",
    btnDark: "#121212",
    btnDanger: "#BD1A28",
    btnSuccess: "#03a23a",
  },

  hpColors: {
    high: "#03a23a", // groen
    mid: "#CB9600", // geel
    low: "#BD1A28", // rood
    temp: "#0099CD", // blauw
  },

  fonts: {
    title: "'Cinzel', serif",
    body: "'Lora', serif",
  },

  radius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
  },

  shadow: {
    card: "0 2px 6px rgba(0,0,0,0.07)",
  },

  components: {
    card: {
      padding: 12,
      background: "#FFFFFF",
      borderRadius: 12,
      border: "1px solid #D1D5DB",
    },

    button: {
      base: {
        padding: "10px 14px",
        borderRadius: 8,
        fontWeight: 700,
        fontFamily: "'Cinzel', serif",
        border: "none",
        cursor: "pointer",
        color: "#FFFFFF",
      },
    },

    acShield: {
      width: 34,
      height: 40,
      background: "#121212",
      borderRadius: "10px 10px 14px 14px",
      border: "2px solid #9ca3af",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 700,
      fontSize: 13,
    },
  },
};

export default theme;

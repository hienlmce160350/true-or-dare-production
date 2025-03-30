import { alpha } from "@mui/material/styles";

// ----------------------------------------------------------------------

export type ColorSchema =
  | "primary"
  | "secondary"
  | "info"
  | "success"
  | "warning"
  | "error";

declare module "@mui/material/styles/createPalette" {
  interface TypeBackground {
    neutral: string;
  }
  interface SimplePaletteColorOptions {
    lighter: string;
    darker: string;
  }
  interface PaletteColor {
    lighter100: string;
    lighter200: string;
    lighter300: string;
    lighter: string;
    darker: string;
  }

  interface SeatColorOptions {
    seatDefault: {
      DEFAULT: string;
      foreground: string;
    };
    seatBooked: {
      DEFAULT: string;
      foreground: string;
    };
    seatOnHold: {
      DEFAULT: string;
      foreground: string;
    };
    seatEco: {
      DEFAULT: string;
      foreground: string;
    };
    seatVip: {
      DEFAULT: string;
      foreground: string;
    };
    seatBusiness: {
      DEFAULT: string;
      foreground: string;
    };
    seatPresident: {
      DEFAULT: string;
      foreground: string;
    };
    seatSeries: {
      DEFAULT: string;
      foreground: string;
    };
  }
  interface Palette {
    seat: SeatColorOptions;
  }
}

// SETUP COLORS

// Start: Minimal color theme
// export const grey = {
//   0: '#FFFFFF',
//   100: '#F9FAFB',
//   200: '#F4F6F8',
//   300: '#DFE3E8',
//   400: '#C4CDD5',
//   500: '#919EAB',
//   600: '#637381',
//   700: '#454F5B',
//   800: '#212B36',
//   900: '#161C24',
// };

// export const primary = {
//   lighter: '#C8FAD6',
//   light: '#5BE49B',
//   main: '#00A76F',
//   dark: '#007867',
//   darker: '#004B50',
//   contrastText: '#FFFFFF',
// };

// export const secondary = {
//   lighter: '#EFD6FF',
//   light: '#C684FF',
//   main: '#8E33FF',
//   dark: '#5119B7',
//   darker: '#27097A',
//   contrastText: '#FFFFFF',
// };

// export const info = {
//   lighter: '#CAFDF5',
//   light: '#61F3F3',
//   main: '#00B8D9',
//   dark: '#006C9C',
//   darker: '#003768',
//   contrastText: '#FFFFFF',
// };

// export const success = {
//   lighter: '#D3FCD2',
//   light: '#77ED8B',
//   main: '#22C55E',
//   dark: '#118D57',
//   darker: '#065E49',
//   contrastText: '#ffffff',
// };

// export const warning = {
//   lighter: '#FFF5CC',
//   light: '#FFD666',
//   main: '#FFAB00',
//   dark: '#B76E00',
//   darker: '#7A4100',
//   contrastText: grey[800],
// };

// export const error = {
//   lighter: '#FFE9D5',
//   light: '#FFAC82',
//   main: '#FF5630',
//   dark: '#B71D18',
//   darker: '#7A0916',
//   contrastText: '#FFFFFF',
// };

// export const common = {
//   black: '#000000',
//   white: '#FFFFFF',
// };

// export const action = {
//   hover: alpha(grey[500], 0.08),
//   selected: alpha(grey[500], 0.16),
//   disabled: alpha(grey[500], 0.8),
//   disabledBackground: alpha(grey[500], 0.24),
//   focus: alpha(grey[500], 0.24),
//   hoverOpacity: 0.08,
//   disabledOpacity: 0.48,
// };
// End: Minimal color theme

// Start: Ferry ticket color theme
export const grey = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
};

// export const primary = {
//   lighter100: '#e0f9d3',
//   lighter200: '#bcf3a9',
//   lighter300: '#88db77',
//   lighter: '#58b74f',
//   main: '#218721',
//   600: '#187420',
//   700: '#10611e',
//   darker: '#0a4e1c',
//   900: '#06401a',
// };

export const secondary = {
  // 100: '#EFD6FF',
  200: "#F4F6F8",
  // 300: '#C684FF',
  400: "#C4CDD5",
  main: "#919EAB",
  600: "#637381",
  // 700: '#5119B7',
  800: "#212B36",
  // 900: '#27097A',
};

// export const info = {
//   lighter100: '#d0dffc',
//   lighter200: '#a3bff9',
//   lighter300: '#7297ed',
//   lighter: '#4d74db',
//   main: '#1b45c4',
//   600: '#1334a8',
//   700: '#0d268d',
//   darker: '#081a71',
//   900: '#05125e',
// };

// export const success = {
//   100: '#dcfcd6',
//   200: '#b3f9af',
//   300: '#83ed87',
//   400: '#61db71',
//   main: '#33c454',
//   600: '#25a84f',
//   700: '#198d4a',
//   800: '#107142',
//   900: '#095e3d',
// };

// export const warning = {
//   100: '#fef8cb',
//   200: '#feee98',
//   300: '#fce265',
//   400: '#fad53e',
//   main: '#f7c100',
//   600: '#d4a100',
//   700: '#b18200',
//   800: '#8f6600',
//   900: '#765100',
// };

// export const error = {
//   lighter100: '#ffe9d5',
//   lighter200: '#ffceac',
//   lighter300: '#ffac82',
//   lighter: '#ff8b63',
//   main: '#ff5630',
//   600: '#db3723',
//   700: '#b71d18',
//   darker: '#930f14',
//   900: '#7a0916',
// };

export const primary = {
  lighter100: "#D7D8F9",
  lighter200: "#B1B3F4",
  lighter300: "#8286DE",
  lighter: "#5C5FBD",
  main: "#2E3192",
  600: "#21247D",
  700: "#171969",
  darker: "#0E1054",
  900: "#080946",
};

export const success = {
  lighter100: "#E4F9D0",
  lighter200: "#C5F3A4",
  lighter300: "#95DB70",
  lighter: "#66B848",
  main: "#30891A",
  600: "#1F7513",
  700: "#11620D",
  darker: "#084F0A",
  900: "#04410B",
};

export const info = {
  lighter100: "#C6F8EB",
  lighter200: "#91F2E0",
  lighter300: "#56D8CB",
  lighter: "#2CB2AF",
  main: "#00777F",
  600: "#005D6D",
  700: "#00465B",
  darker: "#003249",
  900: "#00243C",
};

export const warning = {
  lighter100: "#FCF3CA",
  lighter200: "#F9E496",
  lighter300: "#EDCB61",
  lighter: "#DBAF39",
  main: "#C48A03",
  600: "#A87102",
  700: "#8D5A01",
  darker: "#714500",
  900: "#5E3600",
};

export const error = {
  lighter100: "#FADFD3",
  lighter200: "#F5BAAA",
  lighter300: "#E1877A",
  lighter: "#C35753",
  main: "#9B252B",
  600: "#851B29",
  700: "#6F1227",
  darker: "#590B24",
  900: "#4A0722",
};

// export const seat = {
//   seatDefault: {
//     DEFAULT: '#dee3e7',
//     foreground: '#000000',
//   },
//   seatBooked: {
//     DEFAULT: '#b91d18',
//     foreground: '#ffffff',
//   },
//   seatOnHold: {
//     DEFAULT: '#006f9e',
//     foreground: '#ffffff',
//   },
//   seatEco: {
//     DEFAULT: '#dee3e7',
//     foreground: '#000000',
//   },
//   seatVip: {
//     DEFAULT: '#ffd666',
//     foreground: '#000000',
//   },
//   seatBusiness: {
//     DEFAULT: '#118d57',
//     foreground: '#000000',
//   },
//   seatPresident: {
//     DEFAULT: '#5119b8',
//     foreground: '#ffffff',
//   },
//   seatSeries: {
//     DEFAULT: '#e8c8f8',
//     foreground: '#000000',
//   },
// };
// End: Ferry ticket color theme

export const common = {
  black: "#000000",
  white: "#FFFFFF",
};

export const action = {
  hover: alpha(grey[500], 0.08),
  selected: alpha(grey[500], 0.16),
  disabled: alpha(grey[500], 0.8),
  disabledBackground: alpha(grey[500], 0.24),
  focus: alpha(grey[500], 0.24),
  hoverOpacity: 0.08,
  disabledOpacity: 0.48,
};

const base = {
  primary,
  secondary,
  info,
  success,
  warning,
  error,
  grey,
  common,
  divider: alpha(grey[500], 0.2),
  action,
  // seat,
};

// ----------------------------------------------------------------------

export function palette(mode: "light" | "dark") {
  const light = {
    ...base,
    mode: "light",
    text: {
      primary: common.black,
      secondary: grey[600],
      disabled: grey[500],
    },
    background: {
      paper: "#FFFFFF",
      default: "#FFFFFF",
      neutral: grey[200],
    },
    action: {
      ...base.action,
      active: grey[600],
    },
  };

  const dark = {
    ...base,
    mode: "dark",
    text: {
      primary: "#FFFFFF",
      secondary: grey[500],
      disabled: grey[600],
    },
    background: {
      paper: grey[800],
      default: grey[900],
      neutral: alpha(grey[500], 0.12),
    },
    action: {
      ...base.action,
      active: grey[500],
    },
  };

  return mode === "light" ? light : dark;
}

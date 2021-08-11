import Inter from './inter';
import { createTheme } from '@material-ui/core/styles';
import palette from "./palette";

// Create a theme instance.
export const theme = createTheme({
  typography:{ fontFamily: [
    'Inter',
    'Roboto',
    '"Segoe UI"',
    'BlinkMacSystemFont',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(',') },
  palette: palette,
  shape: {
    borderRadius: 16,
  },
  overrides: {
    body: {
      width: '100%',
      height: '100%',
    },
    MuiCssBaseline: {
      '@global': {
        //@ts-expect-error
        '@font-face': [...Inter],
      },
    },
  },
});


export default theme;

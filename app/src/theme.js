import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Create a theme instance.

/*
#5130a4 // bright green
#95F2D9 // light green
#B8CDF8 // light purple
#9D8DF1 // dark purple

#41463D // grey
*/
const theme = createMuiTheme({
  typography: {
    fontFamily: '"Montserrat", "Helvetica", "Arial", "sans-serif"',
  },
  palette: {
    type: "light",
    primary: {
      main: '#5130a4',
    },
    secondary: {
      main: '#9D8DF1',
    },
    error: {
      main: red.A400,
    },
    background: {},
    // background: {
    //   paper: "#fff",
    //   default: "#fafafa"
    // },
  },
});

export default theme;

import { createMuiTheme } from '@material-ui/core'
import { darkShadows } from '@zeliot/common/constants/shadows'

var defaultTheme = {
  mode: 'light',
  palette: {
    type: 'light',
    primary: {
      main: '#ff3366',
      light: '#f76699',
      dark: '#e3174a',
    },
    secondary: {
      main: '#919191',
      light: '#aaaaaa',
      dark: '#f0f0f0',
    },
    default: {
      main: '#ffffff',
    },
    link: {
      main: '#ff3366',
    },
  },
}

var darkTheme = createMuiTheme({
  mode: 'dark',
  palette: {
    type: 'dark',
    primary: {
      main: '#ff3366',
      light: '#f76699',
      dark: '#e3174a',
    },
    secondary: {
      main: '#616161',
      light: '#394561',
      dark: '#131824',
    },
    default: {
      main: '#ffffff',
    },
    background: {
      default: '#0d0d0d',
      paper: '#212121',
    },
    link: {
      main: '#ff3366',
    },
  },
  shadows: darkShadows,
})

var nonWlDefaultTheme = {
  mode: 'light',
  palette: {
    type: 'light',
    primary: {
      main: '#ff3366',
      light: '#f76699',
      dark: '#e3174a',
    },
    secondary: {
      main: '#919191',
      light: '#aaaaaa',
      dark: '#f0f0f0',
    },
    default: {
      main: '#ffffff',
    },
    link: {
      main: '#ff3366',
    },
  },
}

var nonWlDarkTheme = createMuiTheme({
  mode: 'dark',
  palette: {
    type: 'dark',
    primary: {
      main: '#ff3366',
      light: '#f76699',
      dark: '#e3174a',
    },
    secondary: {
      main: '#616161',
      light: '#394561',
      dark: '#131824',
    },
    default: {
      main: '#ffffff',
    },
    background: {
      default: '#0d0d0d',
      paper: '#212121',
    },
    link: {
      main: '#ff3366',
    },
  },
  shadows: darkShadows,
})

export { defaultTheme, darkTheme, nonWlDefaultTheme, nonWlDarkTheme }

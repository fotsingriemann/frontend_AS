import { withStyles, Button } from '@material-ui/core'

export const ColorButton = withStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
    },
  },
}))(Button)

import React from 'react'
import { Paper, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  rounded: {
    borderRadius: theme.spacing(2)
  }
}))

const RoundedPaper = React.forwardRef(({ children, ...otherProps }, ref) => {
  const classes = useStyles()

  return (
    <Paper classes={{ rounded: classes.rounded }} {...otherProps} ref={ref}>
      {children}
    </Paper>
  )
})

export default RoundedPaper

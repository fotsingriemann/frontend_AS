import React from 'react'
import { ButtonBase, Grid, Typography, makeStyles } from '@material-ui/core'
import { ExpandMore, ExpandLess } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  headerButton: {
    width: '100%',
    padding: theme.spacing(1),
    '&:hover': {
      background: theme.palette.primary.light
    }
  },

  fullFlex: {
    flex: 1
  }
}))

function AnalyticGroupHeader(props) {
  const classes = useStyles()
  const { onToggle, open, children } = props

  return (
    <ButtonBase
      onClick={onToggle}
      disableRipple
      disableTouchRipple
      className={classes.headerButton}
    >
      <Grid container alignItems="center">
        <Grid item className={classes.fullFlex}>
          <Typography variant="h5" align="center">
            {children}
          </Typography>
        </Grid>

        <Grid item>{!open ? <ExpandMore /> : <ExpandLess />}</Grid>
      </Grid>
    </ButtonBase>
  )
}

export default AnalyticGroupHeader

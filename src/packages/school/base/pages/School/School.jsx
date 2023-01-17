import React from 'react'
import withGoogleMaps from '@zeliot/common/hoc/withGoogleMaps'
import DashSchoolDetails from '@zeliot/school/base/modules/DashboardWidgets/DashboardSchoolDetails'

import { Grid, Typography, withStyles, Divider } from '@material-ui/core'

const style = theme => ({
  root: {
    padding: theme.spacing(2)
  },
  textCenter: {
    textAlign: 'center'
  },
  textRight: {
    textAlign: 'right'
  },
  textleft: {
    textAlign: 'left'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  widgetIcon: {
    fontSize: 60
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  bottomBorder: {
    borderBottomStyle: 'solid',
    borderBottomWidth: '1px',
    borderBottomColor: '#c4c4c4'
  },
  leftBorder: {
    borderLeftStyle: 'solid',
    borderLeftWidth: '1px',
    borderLeftColor: '#c4c4c4'
  }
})

class School extends React.Component {
  render() {
    const { classes } = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="flex-start" alignItems="center">
              <Grid item>
                <Typography variant="h5" className={classes.textLeft}>
                  Schools
                </Typography>
              </Grid>
            </Grid>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <DashSchoolDetails />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withGoogleMaps(withStyles(style)(School))

import React, { Component } from 'react'
import classNames from 'classnames'
import { Grid, Typography, withStyles, Divider } from '@material-ui/core'
import VideoDashboard from '@zeliot/core/base/modules/VideoDashboard'

const styles = theme => ({
  pageContainer: {
    padding: theme.spacing(1)
  },
  paperContainer: {
    padding: theme.spacing(3)
  },
  noWrap: {
    flexWrap: 'noWrap'
  },
  fullHeight: {
    height: '100%'
  },
  flex: {
    flex: 1
  },
  dividerPadding: {
    padding: `${theme.spacing(1)}px 0px`
  }
})

class VideoStreamPage extends Component {
  render() {
    const { classes } = this.props

    return (
      <div className={classes.fullHeight}>
        <Grid
          container
          direction="column"
          className={classNames(
            classes.fullHeight,
            classes.paperContainer,
            classes.noWrap
          )}
        >
          <Grid item>
            <Typography variant="h5">Live video streaming</Typography>
          </Grid>
          <Grid item className={classes.dividerPadding}>
            <Divider />
          </Grid>
          <br />

          <Grid item className={classes.flex}>
            <VideoDashboard />
          </Grid>
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(VideoStreamPage)

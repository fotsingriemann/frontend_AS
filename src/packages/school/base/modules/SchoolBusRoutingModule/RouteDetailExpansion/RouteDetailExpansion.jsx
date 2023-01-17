import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import {
  withStyles,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Typography,
  Grid
} from '@material-ui/core'

const styles = theme => ({
  root: {
    width: '100%'
  },
  expansionPanel: {
    paddingBottom: '4px'
  }
})

function getAreaNameList(areaObject) {
  const areaName = []
  areaObject.forEach(aoi => {
    areaName.push(aoi.name)
  })
  return areaName
}

class RouteDetailExpansion extends Component {
  state = {
    rowHovered: false
  }

  render() {
    const { classes, route, index } = this.props
    return (
      <div className={classes.root}>
        <ExpansionPanel
          onMouseEnter={() => {
            this.setState({ rowHovered: true }, () => {
              this.props.routeOnViewHovered(index, this.state.rowHovered)
            })
          }}
          onMouseLeave={() => {
            this.setState({ rowHovered: false }, () => {
              this.props.routeOnViewHovered(index, this.state.rowHovered)
            })
          }}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container>
              <Grid item sm={6}>
                <Typography color="textSecondary">Name</Typography>
              </Grid>
              <Grid item sm={6}>
                <Typography>{route.name}</Typography>
              </Grid>
            </Grid>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Grid container>
              <Grid item sm={12}>
                <Grid container className={classes.expansionPanel}>
                  <Grid item sm={6}>
                    <Typography color="textSecondary">
                      Route Capacity
                    </Typography>
                  </Grid>
                  <Grid item sm={6}>
                    <Typography>{route.capacity}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12}>
                <Grid container className={classes.expansionPanel}>
                  <Grid item sm={6}>
                    <Typography color="textSecondary">
                      Seats Required
                    </Typography>
                  </Grid>
                  <Grid item sm={6}>
                    <Typography>{route.load}</Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12} />
              <Grid container className={classes.expansionPanel}>
                <Grid item sm={6}>
                  <Typography color="textSecondary">Points Covered</Typography>
                </Grid>
                <Grid item sm={6}>
                  <Typography>
                    {getAreaNameList(route.aoiOrderObject).join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </div>
    )
  }
}

RouteDetailExpansion.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(RouteDetailExpansion)

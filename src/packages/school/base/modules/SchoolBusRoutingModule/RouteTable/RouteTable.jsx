import React, { Component, Fragment } from 'react'
import EditIcon from '@material-ui/icons/Edit'
import DoneIcon from '@material-ui/icons/Done'

import {
  withStyles,
  Tooltip,
  IconButton,
  Input,
  Card,
  CardContent,
  Typography,
  Grid
} from '@material-ui/core'

const styles = theme => ({
  cardRow: {
    height: '48px'
  }
})

class RouteTableRow extends Component {
  state = {
    rowHovered: false,
    editMode: false,
    name: ''
  }

  handleEdit = index => event => {
    this.setState(
      {
        editMode: true
      },
      () => {
        this.props.routeNameValidationChange(index, !this.state.editMode)
      }
    )
  }

  handleValueChange = event => {
    this.setState({ name: event.target.value })
  }

  render() {
    const { value, index, pointsSaved } = this.props

    return (
      <div>
        <Card square elevation={2}>
          <CardContent
            onMouseEnter={() => {
              if (pointsSaved) {
                this.setState({ rowHovered: true }, () => {
                  this.props.routeTableHovered(index, this.state.rowHovered)
                })
              }
            }}
            onMouseLeave={() => {
              if (pointsSaved) {
                this.setState({ rowHovered: false }, () => {
                  this.props.routeTableHovered(index, this.state.rowHovered)
                })
              }
            }}
          >
            <Grid container>
              <Grid item sm={12} className={this.props.classes.cardRow}>
                <Grid
                  container
                  alignItems="center"
                  justify="center"
                  className={this.props.classes.cardRow}
                >
                  <Grid item sm={4}>
                    <Typography color="textSecondary">Name</Typography>
                  </Grid>
                  <Grid item sm={6}>
                    {this.state.editMode ? (
                      <Input
                        style={{ width: '100px' }}
                        value={this.state.name}
                        onChange={this.handleValueChange}
                      />
                    ) : (
                      <Typography>{value.name}</Typography>
                    )}
                  </Grid>
                  <Grid item sm={2}>
                    {this.state.rowHovered ? (
                      <Fragment>
                        {this.state.editMode ? (
                          <IconButton
                            color="primary"
                            onClick={() => {
                              if (!(this.state.name === '')) {
                                this.setState({ editMode: false }, () => {
                                  this.props.routeNameValidationChange(
                                    index,
                                    !this.state.editMode
                                  )
                                })
                              }
                              this.props.handleRouteEdit(value, this.state.name)
                            }}
                          >
                            <DoneIcon />
                          </IconButton>
                        ) : (
                          <Tooltip title="Edit names">
                            <IconButton onClick={this.handleEdit(index)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Fragment>
                    ) : (
                      <div />
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item sm={12} className={this.props.classes.cardRow}>
                <Grid
                  container
                  alignItems="center"
                  justify="center"
                  // className={this.props.classes.cardRow}
                >
                  <Grid item sm={4}>
                    <Typography color="textSecondary">
                      Points Covered
                    </Typography>
                  </Grid>
                  <Grid item sm={8}>
                    <Typography>{value.aoiOrder.join(', ')}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* <Grid item sm={12} className={this.props.classes.cardRow}>
                <Grid
                  container
                  alignItems="center"
                  // className={this.props.classes.cardRow}
                >
                  <Grid item sm={4}>
                    <Typography color="textSecondary">
                      Vehicle Allotted
                    </Typography>
                  </Grid>
                  <Grid item sm={8}>
                    <Typography>{value.vehicle}</Typography>
                  </Grid>
                </Grid>
              </Grid> */}

              <Grid item sm={12} className={this.props.classes.cardRow}>
                <Grid
                  container
                  alignItems="center"
                  // className={this.props.classes.cardRow}
                >
                  <Grid item sm={4}>
                    <Typography color="textSecondary">
                      Seats required
                    </Typography>
                  </Grid>
                  <Grid item sm={8}>
                    <Typography>{value.load}</Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item sm={12} className={this.props.classes.cardRow}>
                <Grid
                  container
                  alignItems="center"
                  // className={this.props.classes.cardRow}
                >
                  <Grid item sm={4}>
                    <Typography color="textSecondary">
                      Route Capacity
                    </Typography>
                  </Grid>
                  <Grid item sm={8}>
                    <Typography>{value.capacity}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    )
  }
}

export default withStyles(styles)(RouteTableRow)

/**
 * @module Vehicles/DeleteGroup
 * @summary This module exports the component for Deleting the group
 */

import React from 'react'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import {
  Typography,
  withStyles,
  Button,
  Grid,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@material-ui/core'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const DELETE_GROUP = gql`
  mutation deleteGroup($groupId: Int!) {
    deleteGroup(groupId: $groupId)
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
    width: '100%',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  button: {
    margin: theme.spacing(2),
  },
})

/**
 * @summary DeleteGroup component
 */
class DeleteGroup extends React.Component {
  /**
   * @property {boolean} open Controls dialog open for group deletion message
   * @property {string} response The response of delete action
   * @property {boolean} result The result of the delete mutation action
   */
  state = {
    open: false,
    response: '',
    result: false,
  }

  /**
   * @callback
   * @summary Opens the response message dialog
   */
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  /**
   * @callback
   * @summary Closes the response message dialog
   */
  handleClose = () => {
    this.setState({ open: false })
    this.props.handleClose()
    this.props.closeModal()
  }

  /**
   * @function
   * @summary Calls the mutation to delete the group
   */
  handleDelete = async (event) => {
    const { data } = await this.props.client.mutate({
      mutation: DELETE_GROUP,
      variables: {
        groupId: this.props.groupId,
      },
    })
    this.setState({ response: data.deleteGroup, open: true, result: true })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h6">Delete Group</Typography>
          </Grid>
          <Divider light style={{ width: '100%' }} />{' '}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Grid item xs={12}>
                  {' '}
                  <Typography variant="subheading">
                    Do you really want to Delete Group, If yes please make sure
                    all the vehicles are un assigned from the group{' '}
                  </Typography>
                </Grid>

                <Grid item>
                  <ColorButton
                    color="primary"
                    variant="contained"
                    onClick={this.handleDelete}
                    className={classes.button}
                    size="medium"
                  >
                    Delete
                  </ColorButton>

                  <ColorButton
                    color="default"
                    variant="contained"
                    onClick={this.props.handleClose}
                    className={classes.button}
                    size="medium"
                  >
                    Cancel
                  </ColorButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Divider light style={{ width: '100%' }} />{' '}
          {this.state.result && (
            <Grid>
              <Dialog
                open={this.state.open}
                keepMounted
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    {this.state.response}
                  </DialogContentText>
                </DialogContent>

                <DialogActions>
                  <Button onClick={this.handleClose} color="primary">
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          )}
        </Grid>
      </div>
    )
  }
}

export default withStyles(styles)(withApollo(DeleteGroup))

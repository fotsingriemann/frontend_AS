/**
 * @module Users/DeleteDialogBox
 * @summary This module exports the component to delete a user
 */

import React from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { withApollo } from 'react-apollo'
import {
  Button,
  withStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Grid,
  Typography,
  Divider,
} from '@material-ui/core'
import { emphasize } from '@material-ui/core/styles/colorManipulator'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'

const DELETE_USER = gql`
  mutation deleteUser($userId: Int!) {
    deleteUser(userId: $userId)
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
    width: '100%',
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
  },
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light'
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      0.08
    ),
  },
  noOptionsMessage: {
    fontSize: 16,
    padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
})

/**
 * @summary DeleteDialogBox component handles deleting a user
 */
class DeleteDialogBox extends React.Component {
  /**
   * @property {boolean} open Boolean to determine whether the dialog to delete a user is open
   * @property {boolean} openSnackbar Boolean to control opening of snackbar
   * @property {string} snackbarContent The content of snackbar
   * @property {string} response The response on deleting a user
   * @property {boolean} result The result on deleting a user
   */
  state = {
    open: false,
    openSnackbar: false,
    snackbarContent: '',
    response: '',
    result: false,
  }

  /**
   * @callback
   * @summary Closes the dialog to delete the user
   */
  handleClose = () => {
    this.setState({ open: false })
    this.props.handleClose()
  }

  /**
   * @function
   * @summary Deletes the user by calling the mutation
   */
  handleDelete = async (event) => {
    const { data } = await this.props.client.mutate({
      mutation: DELETE_USER,
      variables: {
        userId: this.props.userId,
      },
    })

    this.setState({ response: data.deleteUser, open: true, result: true })
  }

  render() {
    const { classes } = this.props

    return (
      <div className={classes.root}>
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Typography variant="h6">Delete User</Typography>
          </Grid>
          <Divider light style={{ width: '100%' }} />{' '}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Grid item xs={12}>
                  {' '}
                  <Typography variant="subheading">
                    Do you really want to Delete User?{' '}
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
                  </ColorButton>{' '}
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

DeleteDialogBox.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(withApollo(DeleteDialogBox))

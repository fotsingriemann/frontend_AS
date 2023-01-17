/**
 * @module Vehicles/AddGroup
 * @summary This module exports the component for adding a new group
 */

import React from 'react'
import gql from 'graphql-tag'
import { Mutation, ApolloConsumer } from 'react-apollo'
import {
  Typography,
  withStyles,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import getLoginId from '@zeliot/common/utils/getLoginId'
import { ColorButton } from '@zeliot/common/ui/PaletteComponent'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const ADD_GROUP = gql`
  mutation addGroups($clientLoginId: Int!, $groupName: String!) {
    addGroups(clientLoginId: $clientLoginId, groupName: $groupName)
  }
`

const CHECK_GROUP_NAME = gql`
  query checkGroupName($groupName: String!, $clientLoginId: Int!) {
    checkGroupName(groupName: $groupName, clientLoginId: $clientLoginId)
  }
`

const GET_ALL_GROUPS = gql`
  query allGroupsDetails($clientLoginId: Int!) {
    allGroupsDetails(clientLoginId: $clientLoginId) {
      id
      groupName
      assignedVehicles {
        vehicleNumber
      }
      createdAt
    }
  }
`

const styles = (theme) => ({
  root: {
    padding: theme.spacing(2),
    flexGrow: 1,
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
 * @summary AddGroups component creates new groups
 */
class AddGroups extends React.Component {
  /**
   * @property {string} groupName The name of the group
   * @property {boolean} open Whether to open the modal for message display
   * @property {boolean} isGroupNameValid Whether group name is valid
   */
  state = {
    groupName: '',
    open: false,
    isGroupNameValid: true,
  }

  /**
   * @callback
   * @summary Create new group
   */
  handleSave = (addGroups) => async (e) => {
    e.preventDefault()

    const response = await addGroups({
      variables: {
        clientLoginId: getLoginId(),
        groupName: this.state.groupName,
      },
      refetchQueries: [
        {
          query: GET_ALL_GROUPS,
          variables: {
            clientLoginId: getLoginId(),
          },
        },
      ],
    })

    if (response.data.addGroups) this.handleClickOpen()
  }

  /**
   * @callback
   * @summary Opens the modal on click
   */
  handleClickOpen = () => {
    this.setState({ open: true })
  }

  /**
   * @callback
   * @summary Closes the modal
   */
  handleClose = () => {
    this.setState({ open: false })
  }

  /**
   * @callback
   * @summary Handles change in form fields
   */
  handleFormChange = (client) => (event) => {
    this.setState({ [event.target.name]: event.target.value })
    if (event.target.value.length < 5 || event.target.value.length > 32) {
      // invalid group name
      this.setState({
        isGroupNameValid: 'NOT_AVAILABLE',
      })
      return
    }

    this.setState({ [event.target.name]: event.target.value }, async () => {
      const { data } = await client.query({
        query: CHECK_GROUP_NAME,
        variables: {
          groupName: this.state.groupName,
          clientLoginId: getLoginId(),
        },
        fetchPolicy: 'network-only',
      })
      this.setState({
        isGroupNameValid: data.checkGroupName,
      })
    })
  }

  render() {
    const { classes, selectedLanguage } = this.props

    return (
      <ApolloConsumer>
        {(client) => (
          <div className={classes.root}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="h5">
                  {
                    languageJson[selectedLanguage].vehiclesPage.groupsTable
                      .groupCreation.groupTabTitle
                  }
                </Typography>
                <Typography color="textPrimary" variant="subtitle1">
                  Type a Group name and click create. All group names have to be
                  unique.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Mutation
                  mutation={ADD_GROUP}
                  onCompleted={() => {
                    this.setState({ groupName: '' })
                  }}
                >
                  {(addGroups) => (
                    <Grid container spacing={2}>
                      <Grid item>
                        <TextField
                          required
                          id="standard-required"
                          label={
                            languageJson[selectedLanguage].vehiclesPage
                              .groupsTable.groupCreation.cardSearchLabel
                          }
                          name="groupName"
                          value={this.state.groupName}
                          className={classes.textField}
                          margin="normal"
                          onChange={this.handleFormChange(client)}
                          helperText="Should be between 5 and 32 characters"
                        />
                      </Grid>
                      <Grid item>
                        <ColorButton
                          color="primary"
                          variant="contained"
                          onClick={this.handleSave(addGroups)}
                          className={classes.button}
                          disabled={
                            this.state.isGroupNameValid === 'NOT_AVAILABLE' ||
                            this.state.groupName === ''
                          }
                          size="medium"
                        >
                          {
                            languageJson[selectedLanguage].vehiclesPage
                              .groupsTable.groupCreation.createGroupButtonTitle
                          }
                        </ColorButton>
                      </Grid>
                      {'   '}
                      <Grid item>
                        <ColorButton
                          color="default"
                          variant="contained"
                          onClick={this.props.closeAddGroupModal}
                          className={classes.button}
                          size="medium"
                        >
                          {
                            languageJson[selectedLanguage].vehiclesPage
                              .groupsTable.groupCreation.closeButtonTitle
                          }
                        </ColorButton>
                      </Grid>
                      <Grid item>
                        <Typography color="textSecondary" variant="subtitle1">
                          {this.state.isGroupNameValid === 'NOT_AVAILABLE' &&
                          this.state.groupName.length > 4 &&
                          this.state.groupName.length < 33
                            ? 'A Group with same name exists'
                            : ''}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Mutation>
              </Grid>
              <Dialog
                open={this.state.open}
                keepMounted
                onClose={this.handleClose}
                aria-labelledby="alert-dialog-slide-title"
                aria-describedby="alert-dialog-slide-description"
              >
                <DialogTitle id="alert-dialog-slide-title">Status</DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-slide-description">
                    {
                      languageJson[selectedLanguage].vehiclesPage.groupsTable
                        .groupCreation.groupSuccessMsg
                    }
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleClose} color="primary">
                    {
                      languageJson[selectedLanguage].vehiclesPage.groupsTable
                        .groupCreation.createGroupButtonTitle
                    }
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          </div>
        )}
      </ApolloConsumer>
    )
  }
}

export default withLanguage(withStyles(styles)(AddGroups))

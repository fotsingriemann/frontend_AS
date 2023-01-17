import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Agreement from './Agreement'

import { useMutation } from 'react-apollo'
import gql from 'graphql-tag'

const SAVE_CLIENT_LOGIN_ID = gql`
  mutation saveclientLoginId($clientName: String) {
    saveclientLoginId(clientName: $clientName)
  }
`

export default function Popup() {
  const [open, setOpen] = React.useState(true)
  const [saveclientLoginId] = useMutation(SAVE_CLIENT_LOGIN_ID)

  const handleAgree = () => {
    setOpen(false)
    localStorage.setItem('count', 'true')
    saveclientLoginId({
      variables: { clientName: localStorage.getItem('username') }
    })
  }
  const handleClose = () => {
    setOpen(false)
    localStorage.setItem('count', 'true')
  }
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        disableBackdropClick
      >
        <DialogTitle id="alert-dialog-title" align="center">
          {'PRIVACY POLICY'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Agreement />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAgree} color="primary" autoFocus>
            Agree
          </Button>
          <Button onClick={handleClose} color="secondary">
            Disagree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

/**
 * @module ImmobilizeModule/PasswordDialog
 * @summary This module exports the PasswordDialog component
 */

import React from 'react'
import {
  DialogTitle,
  DialogContent,
  TextField,
  Dialog,
  DialogActions,
  Button
} from '@material-ui/core'

/**
 * @param {object} props React component props
 * @summary PasswordDialog component shows a Dialog to enter password
 */
function PasswordDialog(props) {
  const [password, setPassword] = React.useState('')

  const { onClose, onSubmit, open } = props

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enter OTP</DialogTitle>

      <DialogContent>
        <TextField
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="OTP"
          type="password"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit(password)}>Confirm</Button>
      </DialogActions>
    </Dialog>
  )
}

export default PasswordDialog

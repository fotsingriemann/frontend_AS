/**
 * @module AlertsDashboard/PasswordDialog
 * @summary Exports PasswordDialog component to confirm password for clearing emergency alerts
 */

import React from 'react'
import {
  DialogTitle,
  DialogContent,
  TextField,
  Dialog,
  DialogActions,
  Button,
  CircularProgress
} from '@material-ui/core'

/**
 * @param {object} props React component props
 * @summary PasswordDialog component renders a password input dialog
 */
function PasswordDialog(props) {
  const [password, setPassword] = React.useState('')

  const { onSubmit, open, isLoading, error, onClose } = props

  const handleClose = () => {
    setPassword('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Device Password</DialogTitle>
      <DialogContent>
        <TextField
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter device Password"
          type="password"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {isLoading ? (
          <CircularProgress size={20} />
        ) : (
          <Button
            variant="outlined"
            onClick={() => onSubmit(password)}
            disabled={!password}
          >
            {error ? 'Retry' : 'Confirm'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default PasswordDialog

import React from 'react'

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Button,
  Slide
} from '@material-ui/core'

import GooglePlayStore from '@zeliot/common/static/png/google-play-badge.png'
import AppleAppStore from '@zeliot/common/static/png/app-store-badge.svg'

import {
  PLAY_STORE_LINK,
  APP_STORE_LINK
} from '@zeliot/common/constants/others'

function Transition(props) {
  return <Slide direction="up" {...props} />
}

function AppStoreDialog({ isAppDialogOpen, closeAppDialog }) {
  return (
    <Dialog
      open={isAppDialogOpen}
      TransitionComponent={Transition}
      keepMounted
      onClose={closeAppDialog}
      aria-labelledby="app-dialog-slide-title"
      aria-describedby="app-dialog-slide-description"
    >
      <DialogTitle id="app-dialog-slide-title">
        {'Download Mobile Apps'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="app-dialog-slide-description">
          To download the latest version of AquilaTrack mobile app, click on the
          links below
        </DialogContentText>
        <Grid container justify="space-around" spacing={2}>
          <Grid item xs={6}>
            <a href={PLAY_STORE_LINK} target="_blank" rel="noopener noreferrer">
              <img
                src={GooglePlayStore}
                alt="google-play-badge"
                height="auto"
                width="100%"
              />
            </a>
          </Grid>
          <Grid item xs={6}>
            <a href={APP_STORE_LINK} target="_blank" rel="noopener noreferrer">
              <img
                alt="app-store-badge"
                src={AppleAppStore}
                height="auto"
                width="100%"
              />
            </a>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeAppDialog} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AppStoreDialog

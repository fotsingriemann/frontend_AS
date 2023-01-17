import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import {
  Grid,
  Typography,
  Modal,
  Paper,
  CircularProgress,
  IconButton,
  withStyles
} from '@material-ui/core'
import { Close } from '@material-ui/icons'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import './custom-video.css'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import moment from 'moment'

const GET_VIDEO = gql`
  query getParticularVideo($videoRequest: VideoRequest!) {
    video: getParticularVideo(videoRequest: $videoRequest) {
      link
      timestamp: videoStartTimestamp
    }
  }
`

const styles = theme => ({
  modalPaper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    minWidth: 100,
    backgroundColor: 'rgb(230, 230, 230)'
  },

  modalHeader: {
    padding: theme.spacing(1)
  },

  modalVideo: {
    width: '100%',
    height: 400,
    position: 'relative'
  },

  modalItem: {
    padding: theme.spacing(3)
  },

  videoContainer: {
    width: 600
  }
})

let loginId = null
class VideoPlayer extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  componentDidMount() {
    this.player = videojs(this.ref.current, { controls: true })
    this.setSrc()
    loginId = localStorage.getItem('loginId')
  }

  componentWillUnmount() {
    this.player.dispose()
  }

  setSrc = () => {
    this.player.src({
      type: 'video/mp4',
      src: this.props.video.link
    })

    this.player.play()
  }

  render() {
    const { classes, onClose, video } = this.props

    return (
      <React.Fragment>
        <Grid item xs={12} className={classes.videoContainer}>
          <Grid
            container
            justify="space-between"
            alignItems="center"
            className={classes.modalHeader}
          >
            <Grid item>
              <Typography variant="h5">Video playback</Typography>
              <Typography variant="subtitle1">
                {loginId !== '1962'
                  ? getFormattedTime(video.timestamp, 'lll')
                  : moment
                      .unix(video.timestamp)
                      .utc()
                      .format('lll')}
              </Typography>
            </Grid>

            <Grid item>
              <IconButton onClick={onClose}>
                <Close />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <div
            data-vjs-player
            style={{
              width: '100%',
              height: 400
            }}
          >
            <video ref={this.ref} className="video-js" />
          </div>
        </Grid>
      </React.Fragment>
    )
  }
}

const VideoPlaybackModal = withStyles(styles)(props => {
  const { classes, file, onClose, imei } = props

  return (
    <Paper className={classes.modalPaper}>
      <Grid container alignItems="center" justify="center">
        <Query
          query={GET_VIDEO}
          variables={{
            videoRequest: {
              imei: imei,
              cameraId: file.cameraId,
              timestamp: file.timestamp
            }
          }}
        >
          {({ loading, error, data }) => {
            if (loading) {
              return (
                <Grid item className={classes.modalItem}>
                  <CircularProgress />
                </Grid>
              )
            }

            if (error) {
              return (
                <Grid item className={classes.modalItem}>
                  <Typography variant="h6" align="center">
                    Error playing video
                  </Typography>
                </Grid>
              )
            }

            return (
              <VideoPlayer
                video={data.video}
                onClose={onClose}
                classes={classes}
              />
            )
          }}
        </Query>
      </Grid>
    </Paper>
  )
})

function PlaybackVideo(props) {
  const { onClose, playbackFile, imei } = props

  return (
    <Modal
      open={Boolean(playbackFile)}
      onClose={onClose}
      onEscapeKeyDown={onClose}
    >
      <VideoPlaybackModal onClose={onClose} file={playbackFile} imei={imei} />
    </Modal>
  )
}

PlaybackVideo.propTypes = {
  onClose: PropTypes.func.isRequired,
  imei: PropTypes.string.isRequired,
  playbackFile: PropTypes.object
}

export default PlaybackVideo

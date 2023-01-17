import React, { Component } from 'react'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import { withApollo } from 'react-apollo'
import { withStyles, CircularProgress, Typography } from '@material-ui/core'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import './custom-video.css'

const GET_VIDEO_LINK = gql`
  query getLatestVideo($videoRequest: LatestVideoRequest!) {
    video: getLatestVideo(videoRequest: $videoRequest) {
      link
    }
  }
`

const GET_VIDEO_LINK_FROM_TS = gql`
  query getParticularVideo($videoRequest: VideoRequest!) {
    video: getParticularVideo(videoRequest: $videoRequest) {
      link
      timestamp: videoStartTimestamp
    }
  }
`

const VIDEO_GAP_THRESHOLD = 20

const VideoStyles = {
  videoContainer: {
    width: '100%',
    height: 240,
    position: 'relative'
  },

  videoOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000
  },

  videoOverlayText: {
    color: 'white'
  }
}

class Video extends Component {
  constructor(props) {
    super(props)
    this.ref = React.createRef()
  }

  state = {
    playerStatus: 'STABLE',
    videoLink: '',
    error: '',
    showLoader: false
  }

  fetchVideoLink = () => {
    return this.props.client.query({
      query: GET_VIDEO_LINK,
      variables: {
        videoRequest: { imei: this.props.imei, cameraId: this.props.cameraId }
      },
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    })
  }

  pollNextVideo = () => {
    const tryNewVideo = async () => {
      const { data } = await this.fetchVideoLink()

      if (data && data.video && data.video.link) {
        if (data.video.link !== this.state.videoLink) {
          this.setState(
            { videoLink: data.video.link, playerStatus: 'PLAYING' },
            () => {
              clearInterval(this.pollerInstance)

              this.nextVideoLink = this.state.videoLink

              this.player.src({
                type: 'video/mp4',
                src: this.state.videoLink
              })

              this.player.play()

              this.player.on('timeupdate', this.watchVideoProgress)
            }
          )
        }
      }
    }

    this.pollerInstance = setInterval(tryNewVideo, 10000)
  }

  playNextVideo = () => {
    this.over70Percent = false

    if (this.state.videoLink !== this.nextVideoLink && this.nextVideoLink) {
      this.setState({ videoLink: this.nextVideoLink }, () => {
        this.player.src({
          type: 'video/mp4',
          src: this.state.videoLink
        })

        this.player.play()

        this.player.on('timeupdate', this.watchVideoProgress)
      })
    } else {
      this.setState({ playerStatus: 'LOADING' })
      this.pollNextVideo()
    }
  }

  over70Percent = false

  nextVideoLink = ''

  pollerInstance = null

  watchVideoProgress = async () => {
    const percentage = this.player.currentTime() / this.player.duration()
    if (percentage >= 0.7 && !this.over70Percent) {
      this.over70Percent = true

      this.player.one('ended', this.playNextVideo)

      this.player.off('timeupdate', this.watchVideoProgress)

      const { data, errors } = await this.fetchVideoLink()

      if (errors) {
      }

      if (data && data.video && data.video.link) {
        this.nextVideoLink = data.video.link
      }
    }
  }

  startLiveMode = async () => {
    this.setState({ playerStatus: 'LOADING' })
    const { data, errors } = await this.fetchVideoLink()

    if (errors) {
      this.setState({
        playerStatus: 'ERROR',
        error: 'No recent video available'
      })
    }

    if (data && data.video && data.video.link) {
      this.setState(
        { playerStatus: 'PLAYING', videoLink: data.video.link },
        () => {
          this.player.src({
            type: 'video/mp4',
            src: this.state.videoLink
          })

          this.player.play()

          this.player.on('timeupdate', this.watchVideoProgress)
        }
      )
    }
  }

  fetchVideoLinkFromTimestamp = timestamp => {
    return this.props.client.query({
      query: GET_VIDEO_LINK_FROM_TS,
      variables: {
        videoRequest: {
          imei: this.props.imei,
          cameraId: this.props.cameraId,
          timestamp
        }
      },
      // fetchPolicy: 'network-only',
      errorPolicy: 'all'
    })
  }

  latestVideoRequestPromise = null

  showLoader = () => {
    this.setState({ showLoader: true })
    setTimeout(() => {
      this.setState({ showLoader: false })
    }, VIDEO_GAP_THRESHOLD * 1000)
  }

  requestNewVideo = async timestamp => {
    this.props.setClockStatus('PAUSE')
    this.setState({ playerStatus: 'LOADING' })

    const currentPromise = this.fetchVideoLinkFromTimestamp(timestamp)

    this.latestVideoRequestPromise = currentPromise

    const { data, errors } = await currentPromise

    if (currentPromise === this.latestVideoRequestPromise) {
      if (errors) {
        this.setState({ playerStatus: 'ERROR', error: 'Could not fetch video' })
      }

      if (data && data.video && data.video.link) {
        this.setState(
          { playerStatus: 'PLAYING', videoLink: data.video.link },
          () => {
            this.isPlayerReset = false

            this.player.src({
              type: 'video/mp4',
              src: this.state.videoLink
            })

            if (this.props.setTickTock) {
              this.props.setTickTock(Number(timestamp))
            }

            this.player.one('loadedmetadata', () => {
              this.player.play()
              this.player.one('ended', () => {
                this.showLoader()
                this.resetPlayer()
              })
              this.player.one('error', this.resetPlayer)
            })
          }
        )
      }
    }

    this.props.setClockStatus('RUNNING')
  }

  videoIndex = 0

  checkIfVideoWithinThresholdRange = i => {
    if (
      Number(this.props.videoTimeline[i]['timestamp']) === this.props.tickTock
    ) {
      return String(this.props.tickTock)
    }

    const timeDiff =
      Number(this.props.videoTimeline[i]['timestamp']) - this.props.tickTock

    if (
      (timeDiff > 0 && timeDiff <= VIDEO_GAP_THRESHOLD) ||
      (timeDiff < 0 && timeDiff >= -VIDEO_GAP_THRESHOLD)
    ) {
      return this.props.videoTimeline[i]['timestamp']
    }

    return false
  }

  handleTickTock = () => {
    for (let i = 0; i < this.props.videoTimeline.length; i++) {
      const ts = this.checkIfVideoWithinThresholdRange(i)
      if (ts) {
        this.requestNewVideo(ts)
        break
      }
    }
  }

  handleClockStatusChange = () => {
    if (this.player.src()) {
      if (!this.player.paused()) {
        if (this.props.clockStatus === 'PAUSE') {
          this.player.pause()
        }
      } else {
        if (this.props.clockStatus === 'RUNNING') {
          this.player.play()
        }
      }
    }
  }

  handleModeChange = () => {
    this.resetPlayer(() => {
      if (this.props.mode === 'LIVE') {
        this.startLiveMode()
      }
    })
  }

  resetPlayer = cb => {
    this.over70Percent = false
    this.nextVideoLink = ''
    this.isPlayerReset = true

    if (this.pollerInstance) {
      clearInterval(this.pollerInstance)
    }

    this.player.reset()
    this.player.off('ended', this.playNextVideo)
    this.player.off('timeupdate', this.watchVideoProgress)

    this.setState(
      {
        playerStatus: 'STABLE',
        videoLink: ''
      },
      () => {
        if (cb && typeof cb === 'function') {
          cb()
        }
      }
    )
  }

  componentDidMount() {
    this.player = videojs(this.ref.current, { controls: false, muted: true })
  }

  componentWillUnmount() {
    this.player.dispose()
    if (this.pollerInstance) {
      clearInterval(this.pollerInstance)
    }
  }

  isPlayerReset = true

  componentDidUpdate(prevProps) {
    if (prevProps.mode !== this.props.mode) {
      this.handleModeChange()
    }

    if (
      this.props.mode === 'TIMELINE' &&
      this.props.tickTock &&
      prevProps.tickTock !== this.props.tickTock
    ) {
      if (this.isPlayerReset) {
        this.handleTickTock()
      }
    }

    if (prevProps.clockStatus !== this.props.clockStatus) {
      this.handleClockStatusChange()
    }
  }

  render() {
    const { classes, mode } = this.props
    const { playerStatus, error } = this.state

    const showErrorMessage = playerStatus === 'ERROR'
    const showLoader = playerStatus === 'LOADING'
    const showWaitMessage = playerStatus === 'STABLE' && mode === 'TIMELINE'

    return (
      <div className={classes.videoContainer}>
        <div
          data-vjs-player
          className={classes.videoPlayer}
          style={{ width: '100%', height: '100%' }}
        >
          <video ref={this.ref} className="video-js" />
        </div>

        {(showLoader ||
          (this.state.showLoader && playerStatus === 'STABLE')) && (
          <div className={classes.videoOverlay}>
            <CircularProgress />
          </div>
        )}

        {showErrorMessage && (
          <div className={classes.videoOverlay}>
            <Typography className={classes.videoOverlayText} variant="h6">
              {error}
            </Typography>
          </div>
        )}

        {!this.state.showLoader && showWaitMessage && (
          <div className={classes.videoOverlay}>
            <Typography className={classes.videoOverlayText} variant="h6">
              No video available for this time
            </Typography>
          </div>
        )}
      </div>
    )
  }
}

Video.propTypes = {
  imei: PropTypes.string.isRequired,
  cameraId: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired
  // videoTimeline: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  // setClockStatus: PropTypes.func.isRequired,
  // clockStatus: PropTypes.oneOf(['PAUSE', 'RUNNING']),
  // tickTock: PropTypes.string
}

export default withStyles(VideoStyles)(withApollo(Video))

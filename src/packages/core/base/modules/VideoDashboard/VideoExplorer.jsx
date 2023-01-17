import React, { Component } from 'react'
import classNames from 'classnames'
import {
  Grid,
  Typography,
  withStyles,
  InputAdornment,
  IconButton,
  Input,
  CircularProgress,
} from '@material-ui/core'
import VideoIcon from '@zeliot/common/static/svg/mp4.svg'
import getUnixString from '@zeliot/common/utils/time/getUnixString'
import withSharedSnackbar from '@zeliot/common/hoc/withSharedSnackbar'
import moment from 'moment'
import TimePeriodSelector from './TimePeriodSelector'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import { Search, Close } from '@material-ui/icons'

const GET_VIDEOS_LIST = gql`
  query getAvailableVideos($imei: String!, $filters: Filters!) {
    getAvailableVideos(imei: $imei, filters: $filters) {
      imei
      cameraId
      timestamp
    }
  }
`

const VideoFileStyles = (theme) => ({
  fileContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'flex-start',
    flexWrap: 'wrap',
    cursor: 'pointer',
    '&:hover': { background: '#e3ffff' },
  },
  fileLogoContainer: {
    width: '100%',
    padding: theme.spacing(1),
  },
  fileLogo: {
    margin: '0 auto',
    display: 'block',
  },
  fileName: {
    width: 100,
    padding: theme.spacing(1),
    fontSize: 12,
    textAlign: 'center',
  },
})

const VideoFile = withStyles(VideoFileStyles)(({ fileName, classes }) => (
  <div className={classes.fileContainer}>
    <div className={classes.fileLogoContainer}>
      <img
        src={VideoIcon}
        height={75}
        width={75}
        alt="Video Icon"
        className={classes.fileLogo}
      />
    </div>

    <div className={classes.fileName}>{fileName}</div>
  </div>
))

const VideoExplorerStyles = (theme) => ({
  explorerContainer: {
    padding: theme.spacing(3),
  },
  fullWidth: {
    width: '100%',
  },
  filesContainer: {
    padding: 15,
  },
  cameraFilesContainer: {
    maxHeight: 500,
    overflowY: 'auto',
  },
  rightBorder: {
    borderRight: '1px solid grey',
  },
  centerLoader: {
    display: 'flex',
    justifyContent: 'center',
  },
})

let loginId = null

class VideoExplorer extends Component {
  state = {
    option: 'HOUR',
    customFromTime: null,
    customToTime: null,
    from: null,
    to: null,
    files: [],
    videoSearchText: '',
  }

  componentDidMount = () => {
    const { from, to } = this.calculateRange()
    this.setState({ from, to }, () => {
      this.getVideoPlaybacks()
    })
    loginId = localStorage.getItem('loginId')
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.imei && this.props.imei !== prevProps.imei) {
      const { from, to } = this.calculateRange()
      this.setState({ from, to }, () => {
        this.getVideoPlaybacks()
      })
    }
  }

  handleOptionChange = (e) => {
    const option = e.target.value

    this.setState({ option, from: null, to: null }, () => {
      if (option !== 'CUSTOM') {
        this.handleSubmit()
      }
    })
  }

  handleDateTimeChange = (dateType) => (dateTime) =>
    this.setState({
      [dateType]: dateTime,
    })

  getVideoPlaybacks = async () => {
    this.setState({ queryActive: true })

    const { data, errors } = await this.props.client.query({
      query: GET_VIDEOS_LIST,
      variables: {
        imei: this.props.imei,
        filters: {
          cameraIds: [1, 2],
          fromTimestamp: this.state.from,
          toTimestamp: this.state.to,
        },
      },
      errorPolicy: 'all',
    })

    if (errors) {
      this.setState({
        queryActive: false,
        files: [],
      })
    }

    if (data && data.getAvailableVideos) {
      this.setState({
        files: data.getAvailableVideos,
        queryActive: false,
      })
    }
  }

  handleSubmit = () => {
    if (this.props.imei) {
      const { from, to } = this.calculateRange()

      if (from >= to) {
        this.props.openSnackbar('Date range provided is wrong')
      } else if (
        from > getUnixString(moment.now(), loginId == 1962 ? true : false) ||
        to > getUnixString(moment.now(), loginId == 1962 ? true : false)
      ) {
        this.props.openSnackbar('Future dates are not allowed')
      } else {
        this.setState({ from, to, files: [] }, () => {
          this.getVideoPlaybacks()
        })
      }
    } else {
      this.props.openSnackbar('Please choose the vehicle to proceed')
    }
  }

  calculateRange = () => {
    let fromTs
    let toTs = moment.now()

    switch (this.state.option) {
      case 'HOUR': {
        fromTs = moment().subtract(1, 'hour')
        break
      }
      case 'DAY': {
        fromTs = moment().subtract(1, 'day')
        break
      }
      case 'WEEK': {
        fromTs = moment().subtract(1, 'week')
        break
      }
      case 'MONTH': {
        fromTs = moment().subtract(1, 'month')
        break
      }
      default:
        fromTs = this.state.customFromTime
        toTs = this.state.customToTime
        break
    }
    let timeOffset = loginId == '1962' ? moment().utcOffset() * 60 : 0

    fromTs = fromTs ? (moment(fromTs).unix() + timeOffset).toString() : null
    toTs = toTs ? (moment(toTs).unix() + timeOffset).toString() : null

    return { from: fromTs, to: toTs }
  }

  render() {
    const { classes } = this.props
    const {
      customFromTime,
      customToTime,
      option,
      files,
      queryActive,
    } = this.state

    const camera1Files = []
    const camera2Files = []

    const videoSearchTextLowerCase = this.state.videoSearchText.toLowerCase()

    files.forEach((file) => {
      const formattedTime =
        loginId !== '1962'
          ? getFormattedTime(file.timestamp, 'MMM D YYYY HH:mm:ss')
          : moment.unix(file.timestamp).utc().format('MMM D YYYY HH:mm:ss')

      const formattedTimeLowerCase = formattedTime.toLowerCase()

      if (formattedTimeLowerCase.includes(videoSearchTextLowerCase)) {
        const File = (
          <Grid
            item
            xs={6}
            md={4}
            key={file.timestamp}
            title={formattedTime}
            onClick={() => this.props.onVideoRequest(file)}
          >
            <VideoFile fileName={formattedTime} />
          </Grid>
        )

        if (file.cameraId === 1) {
          camera1Files.push(File)
        } else {
          camera2Files.push(File)
        }
      }
    })

    return (
      <Grid container spacing={1} className={classes.explorerContainer}>
        <Grid item xs={12} md={12}>
          <TimePeriodSelector
            option={option}
            from={customFromTime}
            to={customToTime}
            onOptionChange={this.handleOptionChange}
            onDateTimeChange={this.handleDateTimeChange}
            onSubmit={this.handleSubmit}
          />
          <br />
        </Grid>

        <Grid item xs={12}>
          <Grid
            container
            spacing={3}
            className={classes.filesContainer}
            justify="space-between"
          >
            {queryActive ? (
              <Grid item xs={12} className={classes.centerLoader}>
                <CircularProgress />
              </Grid>
            ) : (
              <React.Fragment>
                <Grid item xs={12}>
                  <Input
                    value={this.state.videoSearchText}
                    onChange={(e) =>
                      this.setState({ videoSearchText: e.target.value })
                    }
                    placeholder="Search Videos"
                    startAdornment={
                      <InputAdornment>
                        <Search />
                      </InputAdornment>
                    }
                    endAdornment={
                      this.state.videoSearchText ? (
                        <InputAdornment>
                          <IconButton
                            onClick={() =>
                              this.setState({ videoSearchText: '' })
                            }
                          >
                            <Close />
                          </IconButton>
                        </InputAdornment>
                      ) : null
                    }
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  className={classNames(
                    classes.rightBorder,
                    classes.cameraFilesContainer
                  )}
                >
                  <Typography variant="h6" align="center">
                    Camera 1
                  </Typography>

                  {camera2Files.length > 0 ? (
                    <Grid container>{camera2Files}</Grid>
                  ) : (
                    !queryActive && (
                      <Typography color="error" align="center">
                        No videos available for Camera 1 in this duration.
                      </Typography>
                    )
                  )}
                </Grid>

                <Grid
                  item
                  xs={12}
                  md={6}
                  className={classes.cameraFilesContainer}
                >
                  <Typography variant="h6" align="center">
                    Camera 2
                  </Typography>

                  {camera1Files.length > 0 ? (
                    <Grid container>{camera1Files}</Grid>
                  ) : (
                    !queryActive && (
                      <Typography color="error" align="center">
                        No videos available for Camera 2 in this duration.
                      </Typography>
                    )
                  )}
                </Grid>
              </React.Fragment>
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default withApollo(
  withSharedSnackbar(withStyles(VideoExplorerStyles)(VideoExplorer))
)

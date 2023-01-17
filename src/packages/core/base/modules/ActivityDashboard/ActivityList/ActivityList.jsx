import React, { Component, Fragment } from 'react'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import SearchIcon from '@material-ui/icons/Search'
import getFormattedTime from '@zeliot/common/utils/time/getFormattedTime'
import {
  CircularProgress,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  Typography,
  Grid,
  InputAdornment,
  withStyles,
  Input,
  IconButton,
} from '@material-ui/core'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const ROWS_PER_PAGE = 5

const styles = (theme) => ({
  customFooter: {
    width: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clickableTableRow: {
    cursor: 'pointer',
  },
  button: {
    margin: theme.spacing(1),
  },
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
  },
  buttonContainer: {
    marginTop: 15,
  },
})

// const ROWS_PER_PAGE = 5

class ActivityList extends Component {
  state = {
    currentPage: 0,
    searchValue: '',
    // selectedRow: null
  }

  handlePageChange = (pageNumber) => {
    this.setState({ currentPage: pageNumber })
  }

  handleSearchValueChange = (e) =>
    this.setState({ searchValue: e.target.value })

  onSelectedActivity = (item, index) => {
    // this.setState({ selectedRow: index })
    this.props.onActivityChange(item)
  }

  render() {
    const {
      classes,
      activities,
      dataLoading,
      selectedActivity,
      selectedLanguage,
    } = this.props
    const { currentPage, searchValue } = this.state

    const count = activities.length
    const from = count === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1
    const to = Math.min(count, (currentPage + 1) * ROWS_PER_PAGE)

    const filteredActivities = activities
      .filter((activity) =>
        activity.vehicleNumber.toLowerCase().includes(searchValue.toLowerCase())
      )
      .slice(
        currentPage * ROWS_PER_PAGE,
        currentPage * ROWS_PER_PAGE + ROWS_PER_PAGE
      )

    return (
      <Fragment>
        <Input
          fullWidth
          placeholder="Search Vehicle"
          onChange={this.handleSearchValueChange}
          startAdornment={
            <InputAdornment>
              <SearchIcon />
            </InputAdornment>
          }
        />
        <Table padding="default">
          <TableHead>
            <TableRow>
              <TableCell size="small">
                {
                  languageJson[selectedLanguage].activityPage
                    .activityTableColumn[0]
                }
              </TableCell>
              <TableCell size="small">
                {
                  languageJson[selectedLanguage].activityPage
                    .activityTableColumn[1]
                }
              </TableCell>
              <TableCell size="small">
                {
                  languageJson[selectedLanguage].activityPage
                    .activityTableColumn[2]
                }
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredActivities.map((activity, index) => (
              <TableRow
                hover
                className={classes.clickableTableRow}
                key={index}
                selected={
                  selectedActivity
                    ? !!(
                        activity.uniqueId === selectedActivity.uniqueId &&
                        activity.fromTs === selectedActivity.fromTs
                      )
                    : false
                }
                onClick={() => {
                  this.onSelectedActivity(activity, index)
                }}
              >
                <TableCell size="small">{activity.vehicleNumber}</TableCell>
                <TableCell size="small">
                  {getFormattedTime(activity.fromTs, 'MMM Do, h:mm:ss a')}
                </TableCell>
                <TableCell size="small">
                  {getFormattedTime(activity.toTs, 'MMM Do, h:mm:ss a')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className={classes.customFooter}>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage - 1)
            }}
            disabled={currentPage === 0}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="caption">{`${from} - ${to} of ${count}`}</Typography>
          <IconButton
            onClick={() => {
              this.handlePageChange(currentPage + 1)
            }}
            disabled={currentPage >= Math.ceil(count / ROWS_PER_PAGE) - 1}
          >
            <ChevronRightIcon />
          </IconButton>
        </div>

        {dataLoading && (
          <Grid container justify="center" alignItems="center">
            <Grid item>
              <CircularProgress />
            </Grid>
          </Grid>
        )}
      </Fragment>
    )
  }
}

export default withLanguage(withStyles(styles)(ActivityList))

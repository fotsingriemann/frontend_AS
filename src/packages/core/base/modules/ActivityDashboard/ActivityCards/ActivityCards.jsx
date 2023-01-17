import React from 'react'
import WidgetCard from '@zeliot/common/ui/WidgetCard'
import RunTimeIcon from '@material-ui/icons/Timelapse'
import IdleTimeIcon from '@material-ui/icons/Timer'
import HaltTimeIcon from '@material-ui/icons/TimerOff'
import DistanceIcon from '@material-ui/icons/Straighten'
import HBIcon from '@material-ui/icons/Block'
import HAIcon from '@material-ui/icons/Info'
import { THEME_MAIN_COLORS } from '@zeliot/common/constants/styles'
import { Grid, Typography, Divider, withStyles } from '@material-ui/core'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const styles = (theme) => ({
  root: {
    paddingTop: theme.spacing(2),
  },
})

class ActivityCards extends React.Component {
  timeToString(time) {
    let strTime = ''
    if (time < 61) {
      strTime += time + ' sec'
      return strTime.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
      const min = Math.floor(time / 60)
      if (min < 601) {
        strTime += min + ' min'
        return strTime.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      } else {
        const hrs = Math.floor(min / 60)
        strTime += hrs + ' hrs'
        return strTime.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }
    }
  }

  distanceToString(dist) {
    let strDist = ''
    if (dist < 10000) {
      strDist += dist + ' km'
      return strDist.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    } else {
      let lDist = dist / 100000
      lDist = lDist.toFixed(2)
      strDist = lDist + ' lakh km'
      return strDist
    }
  }

  render() {
    const { selectedActivityDetails, classes, selectedLanguage } = this.props
    return (
      <Grid container spacing={1} className={classes.root}>
        <Grid item xs={12}>
          <Typography variant="button" color="textSecondary">
            {languageJson[selectedLanguage].activityPage.capturedEvents.title}
          </Typography>
        </Grid>
        <Grid item sm={12}>
          <Divider />
        </Grid>
        <Grid item sm={3}>
          <WidgetCard
            widgetTitle={
              languageJson[selectedLanguage].activityPage.capturedEvents
                .distanceCoveredLabel
            }
            widgetValue={this.distanceToString(
              selectedActivityDetails.totalDist
            )}
            WidgetIcon={DistanceIcon}
            widgetIconColor={THEME_MAIN_COLORS.blue}
            // widgetTrend={fuelTrend}
            // trendPeriod={period}
            // onCardClick={() =>
            //   this.props.handleCardClick(
            //     'fuel',
            //     this.periodForQuery(this.state.period)
            //   )
            // }
          />
        </Grid>
        <Grid item sm={3}>
          <WidgetCard
            widgetTitle={
              languageJson[selectedLanguage].activityPage.capturedEvents
                .runningTimeLabel
            }
            widgetValue={this.timeToString(
              selectedActivityDetails.totalRunningTime
            )}
            WidgetIcon={RunTimeIcon}
            widgetIconColor={THEME_MAIN_COLORS.green}
            // widgetTrend={fuelTrend}
            // trendPeriod={period}
            // onCardClick={() =>
            //   this.props.handleCardClick(
            //     'fuel',
            //     this.periodForQuery(this.state.period)
            //   )
            // }
          />
        </Grid>
        <Grid item sm={3}>
          <WidgetCard
            widgetTitle={
              languageJson[selectedLanguage].activityPage.capturedEvents
                .idlingTimeLabel
            }
            widgetValue={this.timeToString(
              selectedActivityDetails.totalIdlingTime
            )}
            WidgetIcon={IdleTimeIcon}
            widgetIconColor={THEME_MAIN_COLORS.honey}
            // widgetTrend={fuelTrend}
            // trendPeriod={period}
            // onCardClick={() =>
            //   this.props.handleCardClick(
            //     'fuel',
            //     this.periodForQuery(this.state.period)
            //   )
            // }
          />
        </Grid>
        <Grid item sm={3}>
          <WidgetCard
            widgetTitle={
              languageJson[selectedLanguage].activityPage.capturedEvents
                .haltTimeLabel
            }
            widgetValue={this.timeToString(
              selectedActivityDetails.totalHaltTime
            )}
            WidgetIcon={HaltTimeIcon}
            widgetIconColor={THEME_MAIN_COLORS.red}
            // widgetTrend={fuelTrend}
            // trendPeriod={period}
            // onCardClick={() =>
            //   this.props.handleCardClick(
            //     'fuel',
            //     this.periodForQuery(this.state.period)
            //   )
            // }
          />
        </Grid>
        <Grid item sm={3}>
          <WidgetCard
            widgetTitle={
              languageJson[selectedLanguage].activityPage.capturedEvents
                .harshAccelerationLabel
            }
            widgetValue={selectedActivityDetails.totalHaCount}
            WidgetIcon={HAIcon}
            widgetIconColor={THEME_MAIN_COLORS.teal}
            // widgetTrend={fuelTrend}
            // trendPeriod={period}
            // onCardClick={() =>
            //   this.props.handleCardClick(
            //     'fuel',
            //     this.periodForQuery(this.state.period)
            //   )
            // }
          />
        </Grid>
        <Grid item sm={3}>
          <WidgetCard
            widgetTitle={
              languageJson[selectedLanguage].activityPage.capturedEvents
                .haltBrakesLabel
            }
            widgetValue={selectedActivityDetails.totalHbCount}
            WidgetIcon={HBIcon}
            widgetIconColor={THEME_MAIN_COLORS.sunshine}
            // widgetTrend={fuelTrend}
            // trendPeriod={period}
            // onCardClick={() =>
            //   this.props.handleCardClick(
            //     'fuel',
            //     this.periodForQuery(this.state.period)
            //   )
            // }
          />
        </Grid>
      </Grid>
    )
  }
}

export default withLanguage(withStyles(styles)(ActivityCards))

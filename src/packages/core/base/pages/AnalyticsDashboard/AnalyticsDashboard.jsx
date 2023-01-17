import React from 'react'
import AnalyticsCards from '@zeliot/core/base/modules/AnalyticsCards'
import ExcelIcon from 'mdi-material-ui/FileExcel'
import moment from 'moment'

import {
  Typography,
  Grid,
  FormControlLabel,
  Radio,
  Divider,
  Button,
  IconButton,
} from '@material-ui/core'
import gql from 'graphql-tag'
import { useQuery, withApollo } from 'react-apollo'
import { DownloadProgressDialogConsumer } from '@zeliot/common/shared/DownloadProgressDialog/DownloadProgressDialog.context'
import withSharedSnackBar from '@zeliot/common/hoc/withSharedSnackbar'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'

const DOWNLOAD_ANALYTICS = gql`
  query getFleetDownloadLink($period: TimeRange!) {
    getFleetDownloadLink(timeRange: $period) {
      downloadLink
    }
  }
`

function AnalyticsDashboard(props) {
  const [analyticsPeriod, setAnalyticsPeriod] = React.useState('DAY')

  /**
   * @function
   * @summary Queries to get report download link and handles downloading the report as PDF or excel
   */
  function downloadReport() {
    let date
    if (analyticsPeriod == 'ALL_TIME') {
      date = 'All_Time'
    } else if (analyticsPeriod == 'DAY') {
      date = moment().subtract(1, 'days').format('DD-MM-YYYY')
    } else if (analyticsPeriod == 'WEEK') {
      let date1 = moment().subtract(7, 'days').format('DD-MM-YYYY')

      let date2 = moment().subtract(1, 'days').format('DD-MM-YYYY')

      date = date1 + '_to_' + date2
    } else if (analyticsPeriod == 'MONTH') {
      let date1 = moment()
        .subtract(1, 'day')
        .subtract(1, 'month')
        .format('DD-MM-YYYY')

      let date2 = moment().subtract(1, 'day').format('DD-MM-YYYY')

      date = date1 + '_to_' + date2
    }

    const period = analyticsPeriod
    const fileName = 'Fleet_Analytics_' + date
    const fileType = 'EXCEL'
    props.downloadReport(
      DOWNLOAD_ANALYTICS,
      {
        period,
        fileType,
      },
      ['getFleetDownloadLink', 'downloadLink'],
      fileName
    )
  }

  return (
    <Grid container>
      <Grid item xs={12} style={{ padding: 16 }}>
        <Typography variant="h5">
          {languageJson[props.selectedLanguage].analyticsPage.pageTitle}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      <Grid item xs={12} style={{ padding: 16 }}>
        <Typography variant="subtitle1">
          {
            languageJson[props.selectedLanguage].common.dateFilter
              .timeRangeLabel
          }
          :
        </Typography>
        <FormControlLabel
          value="DAY"
          control={
            <Radio
              color="primary"
              checked={analyticsPeriod === 'DAY'}
              onChange={() => setAnalyticsPeriod('DAY')}
            />
          }
          label={languageJson[props.selectedLanguage].common.dateFilter.lastDay}
        />
        <FormControlLabel
          value="WEEK"
          control={
            <Radio
              color="primary"
              checked={analyticsPeriod === 'WEEK'}
              onChange={() => setAnalyticsPeriod('WEEK')}
            />
          }
          label={
            languageJson[props.selectedLanguage].common.dateFilter.lastWeek
          }
        />
        <FormControlLabel
          value="MONTH"
          control={
            <Radio
              color="primary"
              checked={analyticsPeriod === 'MONTH'}
              onChange={() => setAnalyticsPeriod('MONTH')}
            />
          }
          label={
            languageJson[props.selectedLanguage].common.dateFilter.lastMonth
          }
        />

        <FormControlLabel
          value="ALL_TIME"
          control={
            <Radio
              color="primary"
              checked={analyticsPeriod === 'ALL_TIME'}
              onChange={() => setAnalyticsPeriod('ALL_TIME')}
            />
          }
          label={languageJson[props.selectedLanguage].common.dateFilter.allTime}
        />

        <IconButton onClick={downloadReport} title="Download Excel Report">
          <ExcelIcon />
        </IconButton>
      </Grid>

      <Grid item xs={12}>
        <AnalyticsCards analyticsPeriod={analyticsPeriod} />
      </Grid>
    </Grid>
  )
}

export default withApollo(
  withLanguage(
    withSharedSnackBar((props) => (
      <DownloadProgressDialogConsumer>
        {({ downloadReport }) => (
          <AnalyticsDashboard downloadReport={downloadReport} {...props} />
        )}
      </DownloadProgressDialogConsumer>
    ))
  )
)

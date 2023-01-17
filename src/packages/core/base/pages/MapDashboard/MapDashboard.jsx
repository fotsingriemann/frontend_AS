import React, { useState } from 'react'
import {
  makeStyles,
  Grid,
  Divider,
  Typography,
  Switch,
  FormControlLabel,
} from '@material-ui/core'
import Loader from '@zeliot/common/ui/Loader/Loader'
import AlertsList from './AlertsList'
import PeriodSelector from './PeriodSelector'
import Popup from './Popup'
import { useQuery } from 'react-apollo'
import gql from 'graphql-tag'
import withLanguage from 'packages/common/language/withLanguage'
import languageJson from 'packages/common/language/language.json'
import { useLocation } from 'react-router-dom'

const GoogleMaps = React.lazy(() =>
  import('@zeliot/core/base/modules/TrackingControls')
)
const Analytics = React.lazy(() =>
  import('@zeliot/core/base/modules/AnalyticsCards')
)

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  textCenter: {
    textAlign: 'center',
  },
  borders: {
    borderRightWidth: '3px',
    borderRightColor: 'gray',
  },
  rightIcon: {
    marginLeft: theme.spacing(1),
  },
}))

const CHECK_USER = gql`
  query CheckClientLoginId($clientName: String) {
    CheckClientLoginId(clientName: $clientName)
  }
`

function MapDashboard({ selectedLanguage }) {
  const [primaryChecked, setPrimaryChecked] = useState(false)
  const [leftText, setLeftText] = useState('#145DA0')
  const [rightText, setRightText] = useState('#000000')
  const { loading, error, data } = useQuery(CHECK_USER, {
    variables: { clientName: localStorage.getItem('username') },
  })

  if (data) {
    let isPresent = data.CheckClientLoginId
    // console.log(typeof x)
    // console.log(window.location.host.includes("aquilatrack"))
    if (!isPresent && !window.location.host.includes('aquilatrack')) {
      // console.log(x)
      localStorage.setItem('agreementDisplayed', 'true')
    }
  }

  const [analyticsPeriod, setAnalyticsPeriod] = React.useState('DAY')

  const classes = useStyles()

  const handleClick = () => {
    setLeftText(leftText == '#145DA0' ? '#000000' : '#145DA0')
    setRightText(rightText == '#000000' ? '#145DA0' : '#000000')

    setPrimaryChecked(!primaryChecked)
  }

  console.log('Bonsoir')
  console.log()

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid container>
          <Grid item sm={12}>
            <Grid container justify="space-between" style={{ padding: '10px' }}>
              <Grid item>
                <Typography variant="h5" className={classes.textLeft}>
                  {useLocation().pathname === '/home/dashboard1' ? 'Dashboard DASUR' : languageJson[selectedLanguage].mainDashboardPage.pageTitle}
                </Typography>
              </Grid>

              <Grid item>
                <Grid container>
                  <Grid item>
                    <FormControlLabel
                      control={
                        <Switch
                          color="secondary"
                          onClick={() => handleClick()}
                        />
                      }
                      label={
                        languageJson[selectedLanguage].mainDashboardPage
                          .deviceOptionButton.primaryDeviceButtonTitle
                      }
                      style={{ color: leftText }}
                      labelPlacement="start"
                    />
                  </Grid>

                  <Grid item style={{ paddingLeft: '5px' }}>
                    <Typography
                      style={{
                        float: 'left',
                        marginTop: '1.19vh',
                        color: rightText,
                      }}
                    >
                      {
                        languageJson[selectedLanguage].mainDashboardPage
                          .deviceOptionButton.secondaryDeviceButtonTitle
                      }
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Divider />
          </Grid>
        </Grid>

        <React.Suspense fallback={<Loader />}>
          <Grid item xs={12}>
            <GoogleMaps
              primaryChecked={primaryChecked}
              analyticsPeriod={analyticsPeriod}
              alertsList={<AlertsList />}
              periodSelector={
                <PeriodSelector
                  analyticsPeriod={analyticsPeriod}
                  setAnalyticsPeriod={setAnalyticsPeriod}
                />
              }
            />
          </Grid>
          {/* <Grid item xs={12}>
						<Analytics analyticsPeriod={analyticsPeriod} />
					</Grid> */}
        </React.Suspense>
      </Grid>
      {localStorage.getItem('count') === 'false' &&
        localStorage.getItem('agreementDisplayed') === 'true' ? (
        <Popup />
      ) : null}

      {/* <div>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{'PRIVACY POLICY'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <Agreement />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Disagree
            </Button>
            <Button onClick={handleClose} color="primary" autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div> */}
    </div>
  )
}

export default withLanguage(MapDashboard)

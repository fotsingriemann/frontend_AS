import React from 'react'
import './Landing.css'
import LoginForm from '@zeliot/core/base/modules/LoginForm'
import Particles from 'react-particles-js'

import { Typography, Grid, Card, CardContent } from '@material-ui/core'

const style = {
  whiteText: {
    color: '#ffffff',
  },
  blackText: {
    color: '#000000',
  },
  gradient2: {
    zIndex: 10,
  },
}

function Landing({ background, logo }) {
  return (
    <div
      style={
        background && {
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
        }
      }
    >
      {!background && (
        <Particles
          params={{
            particles: {
              number: {
                value: 160,
                density: {
                  enable: true,
                },
              },
              size: {
                value: 3,
                random: true,
                anim: {
                  speed: 4,
                  size_min: 0.3,
                },
              },
              line_linked: {
                enable: true,
              },
              move: {
                random: true,
                speed: 1,
                direction: 'top',
                out_mode: 'out',
              },
            },
            interactivity: {
              events: {
                onhover: {
                  enable: true,
                  mode: 'bubble',
                },
                onclick: {
                  enable: true,
                  mode: 'repulse',
                },
              },
              modes: {
                bubble: {
                  distance: 250,
                  duration: 2,
                  size: 0,
                  opacity: 0,
                },
                repulse: {
                  distance: 400,
                  duration: 4,
                },
              },
            },
          }}
          className="particleDiv"
          canvasClassName="canvasStyle"
        />
      )}
      <Grid>
        <Grid>
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            {/* <Card
              sx={{ minWidth: 275 }}
              style={{ marginTop: '15px', marginBottom: '1px', opacity: '.7' }}
            >
              <CardContent>
                <Typography
                  sx={{ fontSize: 16 }}
                  style={{ color: 'red', textWeight: '400' }}
                  align="center"
                >
                  Please Note: This platform will no longer be supported as from
                  Thursday, 28th April 2022, 00h 00.
                </Typography>
                <Typography
                  sx={{ fontSize: 16 }}
                  style={{ color: 'red', textWeight: '400' }}
                  align="center"
                >
                  For any further information, contact the system administrator
                  on +237 693830206
                </Typography>
              </CardContent>
            </Card> */}
          </Grid>
        </Grid>
        <div className="Landing" style={style.gradient2}>
          <Grid
            container
            alignItems="center"
            justify="center"
            className="full-screen"
          >
            <Grid item xs={12} sm={6} md={5} lg={4}>
              <LoginForm logo={logo} />
            </Grid>
            <Grid item xs={12} container justify="space-between">
              <Grid item xs={3} container justify="center">
                <Grid item>
                  <Typography
                    variant="caption"
                    align="center"
                    style={style.whiteText}
                  >
                    <a
                      href="http://www.zeliot.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={style.whiteText}
                    >
                      www.zeliot.in{' '}
                    </a>
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={3} container justify="center">
                <Grid item>
                  <Typography
                    variant="caption"
                    align="center"
                    style={style.whiteText}
                  >
                    Powered by Zeliot Connected Services Pvt Ltd
                  </Typography>
                </Grid>
              </Grid>

              <Grid item xs={3} container justify="center">
                <Grid item>
                  <Typography
                    variant="caption"
                    align="center"
                    style={style.whiteText}
                  >
                    <a
                      href="https://www.itriangle.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={style.whiteText}
                    >
                      www.itriangle.in{' '}
                    </a>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </div>
  )
}

export default Landing

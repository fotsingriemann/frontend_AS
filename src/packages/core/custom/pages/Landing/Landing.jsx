import React from 'react'
import './Landing.css'
import LoginForm from '@zeliot/core/base/modules/LoginForm'
import Particles from 'react-particles-js'
import { Grid } from '@material-ui/core'

const style = {
  whiteText: {
    color: '#ffffff'
  },
  blackText: {
    color: '#000000'
  },
  gradient2: {
    zIndex: 10
  }
}

function Landing({ background, logo }) {
  return (
    <div
      style={
        background && {
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover'
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
                  enable: true
                }
              },
              size: {
                value: 3,
                random: true,
                anim: {
                  speed: 4,
                  size_min: 0.3
                }
              },
              line_linked: {
                enable: true
              },
              move: {
                random: true,
                speed: 1,
                direction: 'top',
                out_mode: 'out'
              }
            },
            interactivity: {
              events: {
                onhover: {
                  enable: true,
                  mode: 'bubble'
                },
                onclick: {
                  enable: true,
                  mode: 'repulse'
                }
              },
              modes: {
                bubble: {
                  distance: 250,
                  duration: 2,
                  size: 0,
                  opacity: 0
                },
                repulse: {
                  distance: 400,
                  duration: 4
                }
              }
            }
          }}
          className="particleDiv"
          canvasClassName="canvasStyle"
        />
      )}
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
        </Grid>
      </div>
    </div>
  )
}

export default Landing

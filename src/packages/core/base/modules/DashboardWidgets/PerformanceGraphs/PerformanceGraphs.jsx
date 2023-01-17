import React, { Component } from 'react'
import ComposedChart from 'recharts/es6/chart/ComposedChart'
import Bar from 'recharts/es6/cartesian/Bar'
import XAxis from 'recharts/es6/cartesian/XAxis'
import YAxis from 'recharts/es6/cartesian/YAxis'
import CartesianGrid from 'recharts/es6/cartesian/CartesianGrid'
import Tooltip from 'recharts/es6/component/Tooltip'
import Label from 'recharts/es6/component/Label'
import Star0 from '@zeliot/common/static/png/star0.png'
import Star25 from '@zeliot/common/static/png/star25.png'
import Star50 from '@zeliot/common/static/png/star50.png'
import Star75 from '@zeliot/common/static/png/star75.png'
import Star100 from '@zeliot/common/static/png/star100.png'

import {
  Card,
  Typography,
  Button,
  Grid,
  GridList,
  GridListTile
} from '@material-ui/core'

export class HorizontalBarGraphs extends Component {
  render() {
    return (
      <Card style={{ padding: 10, marginTop: 10 }}>
        <Grid container justify="space-between">
          <Grid item>
            <Typography color="textSecondary" variant="button">
              {this.props.graphLabel}
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              onClick={() =>
                this.props.onRequestVehicleInfo(this.props.dataKey)
              }
            >
              View all Vehicles
            </Button>
          </Grid>
        </Grid>

        <ComposedChart
          layout="vertical"
          width={750}
          height={300}
          data={this.props.data}
          barGap={2}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <CartesianGrid horizontal={false} vertical={false} />
          <XAxis type="number">
            <Label
              value={this.props.label}
              position="insideBottomRight"
              offset={-15}
            />
          </XAxis>
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            allowDataOverflow={true}
          />
          <Tooltip />
          <Bar
            dataKey={this.props.dataKey}
            barSize={25}
            fill={this.props.barColor}
          />
        </ComposedChart>
      </Card>
    )
  }
}

export class DriverRatings extends Component {
  getStars = score => {
    const imgs = []
    const whole = Math.floor(score)
    const decimal = score - whole
    for (let index = 0; index < whole; index++) {
      imgs.push({ img: Star100 })
    }
    switch (decimal) {
      case 0:
        imgs.push({ img: Star0 })
        break
      case 0.25:
        imgs.push({ img: Star25 })
        break
      case 0.5:
        imgs.push({ img: Star50 })
        break
      case 0.75:
        imgs.push({ img: Star75 })
        break
      default:
        imgs.push({ img: Star0 })
    }
    const zeros = 5 - whole - 1
    for (let index = 0; index < zeros; index++) {
      imgs.push({ img: Star0 })
    }
    return imgs
  }

  render() {
    return (
      <Card style={{ padding: 10, marginTop: 10, height: '100%' }}>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <Typography color="textSecondary" variant="button">
              Best Drivers
            </Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" onClick={this.props.onRequestDriverInfo}>
              View all Drivers
            </Button>
          </Grid>
        </Grid>
        <br />
        {this.props.data.map((driver, index) => (
          <Grid
            key={index}
            container
            style={{ padding: 5 }}
            justify="center"
            alignItems="center"
          >
            <Grid item sm={4}>
              <Typography variant="button">{driver.name}</Typography>
            </Grid>
            <Grid item sm={8}>
              <GridList cols={5} cellHeight="auto">
                {this.getStars(driver.score).map((item, index) => (
                  <GridListTile key={index}>
                    <img
                      src={item.img}
                      alt={''}
                      style={{ height: 30, width: 30 }}
                    />
                  </GridListTile>
                ))}
              </GridList>
            </Grid>
          </Grid>
        ))}
      </Card>
    )
  }
}

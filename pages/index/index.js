const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}
const QQMapWX = require('../../lib/qqmap-wx-jssdk.js')
const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBg: '',
    forecast: [],
    todayTemp: "",
    todayDate: "",
    city: '广州市',
    locationAuthType: UNPROMPTED
  },
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: '7P4BZ-3MO6P-KMGDM-LCHPY-RUZWV-TXFAW'
    })
    this.getNow()
  //   wx.getSetting({
  //     success: res => {
  //       let auth = res.authSetting['scope.userLocation']
  //       this.setData({
  //         locationAuthType: auth ? AUTHORIZED
  //           : (auth === false) ? UNAUTHORIZED : UNPROMPTED
  //       })

  //       if (auth)
  //         this.getCityAndWeather()
  //       else
  //         this.getNow() //使用默认城市广州
  //     },
  //     fail: () => {
  //       this.getNow() //使用默认城市广州
  //     }
  //   })
   },
  startPullDownRefresh(callback) {
    this.getNow(callback);
  },
  getNow(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        console.log(res);
        let result = res.data.result;
        this.setToday(result);
        this.setHourlyWeather(result);
        this.setNow(result);
      },
      complete: (callback) => {
        if (callback !== null)
          wx.stopPullDownRefresh()
      }
    })
  },

  setToday(result) {
    let temp = result.now.temp;
    let weather = result.now.weather;
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBg: '/image/' + weather + '-bg.png',
    });
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },
  //未来24小时的天气情况
  setHourlyWeather(result) {
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    let forecast = result.forecast
    for (let i = 0; i < 24; i += 3) {
      hourlyWeather.push({
        time: (i + nowHour) % 24 + '时',
        iconPath: '/static/img/' + forecast[i / 3].weather + '-icon.png',
        temp: forecast[i / 3].temp+'°'
      })
      forecast[0].time = '现在'
      this.setData({
        forecast: hourlyWeather
      })
    }
  },
  setNow(result) {
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather() {
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city
    })
  },
  onTapLocation() {
    this.getCityAndWeather()
  },
  getCityAndWeather() {
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city
              
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
        })
      }
    })
  }
});
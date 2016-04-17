'use strict';

window.ee = new EventEmitter();

var Weather = React.createClass({
    getInitialState: function() {
        return {
          temp: '',
          city: '',
          description: '',
          id: ''
        };
    },

    componentDidMount: function() {
        this.serverRequest = $.get("http://api.openweathermap.org/data/2.5/weather", {
          q:"Lipetsk",
          APPID:"69d481a6ba27aef3fa09e7100391040f",
          lang:"ru",
          units:"metric"
        }).done(function (result) {
          var weather = result;
          this.setState({
            temp: weather.main.temp,
            city: weather.name,
            description: weather.weather[0].description,
            id: weather.id
          });
        }.bind(this));

        var self = this;
        window.ee.addListener('City.add', function(item) {
          self.setState({
            temp: item[0].temp,
            city: item[0].name,
            description: item[0].description,
            id: item[0].id
          });
        });
    },

    componentWillUnmount: function() {
      window.ee.removeListener('City.add');
    },

    saveCity: function () {
      var cityForSave = this.state.city;
      var cityForSaveId = this.state.id;

      if ($.cookie("my_citys") != null){
        var cookie = JSON.parse($.cookie("my_citys"));
      } else {
        var cookie = {};
      }
      cookie[cityForSave] = cityForSaveId;
      cookie = JSON.stringify(cookie);
      $.cookie('my_citys', cookie, { expires: 30, path: '/' });
    },

    render: function() {
      // var cookie = JSON.parse($.cookie("my_citys"));
      //   if (cookie[this.state.name]) {
      //     var deleteCity = <button>Удалить</button>;
      //   } else {
      //     var deleteCity = null;
      //   }
        return (
          <div className="commentBox">
              <Request />
              <p>{this.state.temp}</p>
              <p>{this.state.city}</p>
              <p>{this.state.description}</p>
              <button onClick={this.saveCity}>Сохранить</button>
              {/*deleteCity*/}
          </div>
        );
    }
});

var Request = React.createClass({
    getInitialState: function() {
        return {
          temp: '',
          city: '',
          description: '',
          id: ''
        };
    },

    handleCityChange: function(e) {
      this.setState({city: e.target.value});
    },

    getCityWeather: function (e) {
        e.preventDefault();
        this.serverRequest = $.get("http://api.openweathermap.org/data/2.5/weather", {
          q:this.state.city,
          APPID:"69d481a6ba27aef3fa09e7100391040f",
          lang:"ru",
          units:"metric"
        }).done(function (result) {
            var weather = result;
            var item = [{
              name: weather.name,
              temp: weather.main.temp,
              description: weather.weather[0].description,
              id: weather.id
            }];
            window.ee.emit('City.add', item);

        }.bind(this));   
    },

    render: function() {
        var temp = this.state.temp;
        return (
          <form onSubmit={this.getCityWeather}>
            <input onChange={this.handleCityChange} type="text" name="city"/>
            <input type="submit" value="Узнать погоду"/>
          </form>
        );
    }
});


ReactDOM.render(
    <Weather />,
    document.getElementById('weather')
);

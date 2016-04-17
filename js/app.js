'use strict';

window.ee = new EventEmitter();

var Weather = React.createClass({
    getInitialState: function() {
        return {
          temp: '',
        };
    },

    componentDidMount: function() {
        this.serverRequest = $.get("http://api.openweathermap.org/data/2.5/weather", {q:"Lipetsk", APPID:"69d481a6ba27aef3fa09e7100391040f", lang:"ru", units:"metric"}).done(function (result) {
          var weather = result;
          this.setState({
            temp: weather.main.temp,
            city: weather.name,
            description: weather.weather[0].description
          });
        }.bind(this));

        var self = this;
        window.ee.addListener('City.add', function(item) {
          console.log(item);
          self.setState({
            temp: item[0].name,
            city: item[0].temp,
            description: item[0].description
          });
        });
    },
    componentWillUnmount: function() {
      window.ee.removeListener('City.add');
    },
    render: function() {
        return (
          <div className="commentBox">
              <Request />
              <p>{this.state.temp}</p>
              <p>{this.state.city}</p>
              <p>{this.state.description}</p>
          </div>
        );
    }
});

var Request = React.createClass({
    getInitialState: function() {
        return {
          temp: '',
          city: '',
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
          units:"metric"}
           ).done(function (result) {
            var weather = result;
            var item = [{
              name: weather.name,
              temp: weather.main.temp,
              description: weather.weather[0].description
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

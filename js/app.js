'use strict';

window.ee = new EventEmitter();
const APPID = "69d481a6ba27aef3fa09e7100391040f";

var Route = ReactRouter.Route;
var Router = ReactRouter.Router;
var IndexRoute = ReactRouter.IndexRoute;
var RouteHandler = ReactRouter.RouteHandler;
var hashHistory = ReactRouter.hashHistory;
var Link = ReactRouter.Link;

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
        $.get("http://api.openweathermap.org/data/2.5/weather", {
            q:"Lipetsk",
            APPID: APPID,
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

        if ($.cookie("my_cities") != null){
            var cookie = JSON.parse($.cookie("my_cities"));
        } else {
            var cookie = {};
        }
        cookie[cityForSave] = cityForSaveId;
        cookie = JSON.stringify(cookie);
        $.cookie('my_cities', cookie, { expires: 30, path: '/' });
    },

    render: function() {
        return (
            <div className="commentBox">
                <Request />
                <p>{this.state.temp}</p>
                <p>{this.state.city}</p>
                <p>{this.state.description}</p>
                <button onClick={this.saveCity}>Сохранить</button>
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
        $.get("http://api.openweathermap.org/data/2.5/weather", {
            q:this.state.city,
            APPID:APPID,
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
        return (
            <form onSubmit={this.getCityWeather}>
                <input onChange={this.handleCityChange} type="text" name="city"/>
                <input type="submit" value="Узнать погоду"/>
            </form>
        );
    }
});
var Nav = React.createClass({
    getInitialState: function() {
        return {
            temp: '',
            city: '',
            description: '',
            id: ''
        };
    },

    render: function() {
        return (
            <div>
                <div><Link to="/">Главная</Link></div>
                <div><Link to="mycities">Мои города</Link></div>
                {this.props.children}
            </div>
        );
    }
});

var Mycities = React.createClass({

    getInitialState: function() {
        return {
            cyties: [],
            count: ''
        };
    },
    
    componentDidMount: function() {
        var cookie = JSON.parse($.cookie("my_cities"));
        var citiesIds;
        for (var key in cookie) {
            if (citiesIds) {
                citiesIds += "," + cookie[key];
            } else {
                citiesIds = cookie[key];
            }
        }
        $.get("http://api.openweathermap.org/data/2.5/group?", {
            id: citiesIds,
            APPID: APPID,
            lang: "ru",
            units: "metric"
        }).done(function (result) {
            this.setState({
                count: result.cnt,
                cyties: result.list
            });
        }.bind(this));

        var self = this;
        window.ee.addListener('City.delete', function() {
            var cookie = JSON.parse($.cookie("my_cities"));
            var citiesIds;
            for (var key in cookie) {
                if (citiesIds) {
                    citiesIds += "," + cookie[key];
                } else {
                    citiesIds = cookie[key];
                }
            }
            $.get("http://api.openweathermap.org/data/2.5/group?", {
                id: citiesIds,
                APPID: APPID,
                lang: "ru",
                units: "metric"
            }).done(function (result) {
                self.setState({
                    count: result.cnt,
                    cyties: result.list
                });
            }.bind(this));
        });
    },

    componentWillUnmount: function() {
        window.ee.removeListener('City.delete');
    },

    render: function() {
        return (
            <div>
                <h1>Мои города</h1>
                <p>{this.state.count}</p>
                <Cities data={this.state.cyties} />
            </div>
        );
    }
});

var Cities = React.createClass({
    getInitialState: function() {
        return {
            temp: '',
            city: '',
            description: '',
            id: ''
        };
    },

    render: function() {
        var data = this.props.data;
        var cityTemplate;

        if (data.length > 0) {
            cityTemplate = data.map(function(item, index) {
                return (
                    <div key={item.id}>
                        <div>{item.name}</div>
                        <div>{item.main.temp}</div>
                        <div>{item.weather[0].description}</div>
                        <Delete data={item.name} />
                    </div>
                )
            })
        } else {
            cityTemplate = <p>NO GOROD</p>
        }

        return (
            <div>
                {cityTemplate}
            </div>
        );
    }
});

var Delete = React.createClass({
    getInitialState: function() {
        return {
            true
        };
    },

    deleteCity: function () {
        var city = this.props.data;
        var cookie = JSON.parse($.cookie("my_cities"));
        delete cookie[city];
        cookie = JSON.stringify(cookie);
        $.cookie('my_cities', cookie, { expires: 30, path: '/' });
        window.ee.emit('City.delete');

    },

    render: function() {
        return (
            <div>
                <button onClick={this.deleteCity}>Удалить</button>
            </div>
        );
    }
});

ReactDOM.render(
    <Router history={hashHistory}>
        <Route path="/" component={Nav}>
            <Route path="mycities" component={Mycities}></Route>
            <IndexRoute component={Weather}></IndexRoute>
        </Route>
    </Router>,
    document.getElementById('weather')
);

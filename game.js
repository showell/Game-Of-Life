(function() {
  var abstract_game_of_life, animate, assert, board_transform_function, data_2d, display, get_toroidal_neighbors, point_lives_next_gen, seed_coords, seed_world, view_2d, world;
  assert = function(cond) {
    if (!cond) {
      debugger;
      throw "assertion error";
    }
  };
  abstract_game_of_life = function(world_factory, point_lives_next_gen) {
    return function(old_world) {
      var cell, fate, is_alive, n, new_world, _i, _len, _ref;
      new_world = world_factory();
      _ref = old_world.cells();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cell = _ref[_i];
        is_alive = old_world.alive(cell);
        n = old_world.num_alive_neighbors(cell);
        fate = point_lives_next_gen(is_alive, n);
        new_world.set(cell, fate);
      }
      return new_world;
    };
  };
  (function() {
    var f, toggle, w, world_factory;
    world_factory = function() {
      var cells, obj;
      cells = [false];
      return obj = {
        cells: function() {
          return [0];
        },
        num_alive_neighbors: function(i) {
          return 0;
        },
        alive: function(i) {
          return cells[i];
        },
        set: function(i, fate) {
          return cells[0] = fate;
        },
        status: function() {
          return cells[0];
        }
      };
    };
    toggle = function(alive, n) {
      return !alive;
    };
    f = abstract_game_of_life(world_factory, toggle);
    w = world_factory();
    assert(!w.status());
    w = f(w);
    assert(w.status());
    w = f(w);
    return assert(!w.status());
  })();
  point_lives_next_gen = function(alive, n) {
    if (alive) {
      return n === 2 || n === 3;
    } else {
      return n === 3;
    }
  };
  (function() {
    assert(point_lives_next_gen(true, 2));
    assert(point_lives_next_gen(true, 3));
    assert(point_lives_next_gen(false, 3));
    return assert(!point_lives_next_gen(false, 4));
  })();
  data_2d = function() {
    var hash, key, obj;
    hash = {};
    key = function(point) {
      var x, y;
      x = point[0], y = point[1];
      return "" + x + "," + y;
    };
    return obj = {
      alive: function(point) {
        return hash[key(point)];
      },
      set: function(point, fate) {
        return hash[key(point)] = fate;
      }
    };
  };
  (function() {
    var d;
    d = data_2d();
    assert(!d.alive([5, 7]));
    d.set([5, 7], true);
    return assert(d.alive([5, 7]));
  })();
  get_toroidal_neighbors = function(point, width, height) {
    var x, x_deltas, y, y_deltas;
    x = point[0], y = point[1];
    x_deltas = [-1, 0, 1, -1, 1, -1, 0, 1];
    y_deltas = [-1, -1, -1, 0, 0, 1, 1, 1];
    return x_deltas.map(function(dx, i) {
      var dy, xx, yy;
      dy = y_deltas[i];
      xx = (x + dx + width) % width;
      yy = (y + dy + height) % height;
      return [xx, yy];
    });
  };
  (function() {
    var expected, result;
    result = get_toroidal_neighbors([1, 1], 10, 10);
    expected = [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
    return assert(result.toString() === expected.toString());
  })();
  world = function(width, height) {
    var cells, data, num_alive_neighbors, obj;
    data = data_2d();
    cells = function() {
      var points, x, y;
      points = [];
      for (x = 0; (0 <= width ? x < width : x > width); (0 <= width ? x += 1 : x -= 1)) {
        for (y = 0; (0 <= height ? y < height : y > height); (0 <= height ? y += 1 : y -= 1)) {
          points.push([x, y]);
        }
      }
      return points;
    };
    num_alive_neighbors = function(loc) {
      var n, neighbors, num, _i, _len;
      num = 0;
      neighbors = get_toroidal_neighbors(loc, width, height);
      for (_i = 0, _len = neighbors.length; _i < _len; _i++) {
        n = neighbors[_i];
        if (data.alive(n)) {
          num += 1;
        }
      }
      return num;
    };
    return obj = {
      alive: data.alive,
      set: data.set,
      cells: cells,
      num_alive_neighbors: num_alive_neighbors
    };
  };
  (function() {
    var w;
    w = world(10, 10);
    assert(w.cells().length === 100);
    w.set([5, 5], true);
    assert(w.alive([5, 5]));
    assert(w.num_alive_neighbors([5, 5]) === 0);
    w.set([5, 6], true);
    assert(w.num_alive_neighbors([5, 5]) === 1);
    w.set([6, 6], true);
    assert(w.num_alive_neighbors([5, 5]) === 2);
    w.set([9, 9], true);
    assert(w.num_alive_neighbors([5, 5]) === 2);
    w.set([6, 6], false);
    return assert(w.num_alive_neighbors([5, 5]) === 1);
  })();
  board_transform_function = function(width, height) {
    var create_world;
    create_world = function() {
      return world(width, height);
    };
    return abstract_game_of_life(create_world, point_lives_next_gen);
  };
  (function() {
    var f, w;
    f = board_transform_function();
    w = world(10, 10);
    w.set([0, 0], true);
    w.set([1, 0], true);
    w.set([2, 0], true);
    assert(w.alive([1, 0]));
    assert(!w.alive([1, 1]));
    w = f(w);
    assert(!w.alive([0, 0]));
    assert(w.alive([1, 0]));
    return assert(w.alive([1, 1]));
  })();
  seed_coords = function() {
    var points, s, seed, x, y, _i, _len, _len2, _ref, _ref2, _results;
    seed = ["X      ", "       ", "XX     ", "       ", "  XXX  ", "       ", "   XXX ", "    X  "];
    points = [];
    for (x = 0, _len = seed.length; x < _len; x++) {
      s = seed[x];
      for (y = 0, _ref = s.length; (0 <= _ref ? y < _ref : y > _ref); (0 <= _ref ? y += 1 : y -= 1)) {
        if (s.charAt(y) !== ' ') {
          points.push([x, y]);
        }
      }
    }
    _results = [];
    for (_i = 0, _len2 = points.length; _i < _len2; _i++) {
      _ref2 = points[_i], x = _ref2[0], y = _ref2[1];
      _results.push([x + 5, y + 5]);
    }
    return _results;
  };
  seed_world = function(world) {
    var coord, _i, _len, _ref, _results;
    _ref = seed_coords();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      coord = _ref[_i];
      _results.push(world.set(coord, true));
    }
    return _results;
  };
  (function() {
    var w;
    w = world(20, 20);
    seed_world(w);
    assert(w.alive([5, 5]));
    assert(w.alive([7, 5]));
    return assert(!w.alive([8, 5]));
  })();
  view_2d = function(width, height) {
    var canvas, ctx;
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    return {
      draw: function(x, y, fate) {
        var h, w;
        ctx.fillStyle = fate ? 'black' : 'white';
        w = 10;
        h = 10;
        x = x * w;
        y = y * h;
        return ctx.fillRect(x, y, w, h);
      }
    };
  };
  display = function(width, height) {
    var view;
    view = view_2d(width, height);
    return {
      render_board: function(board) {
        var fate, x, y, _results;
        _results = [];
        for (x = 0; (0 <= width ? x < width : x > width); (0 <= width ? x += 1 : x -= 1)) {
          _results.push((function() {
            var _results;
            _results = [];
            for (y = 0; (0 <= height ? y < height : y > height); (0 <= height ? y += 1 : y -= 1)) {
              fate = board.alive([x, y]);
              _results.push(view.draw(x, y, fate));
            }
            return _results;
          })());
        }
        return _results;
      }
    };
  };
  animate = function(initial_data, step_function, render_func, delay, max_ticks) {
    var current_data, pulse, tick;
    tick = 0;
    current_data = initial_data;
    pulse = function() {
      tick += 1;
      render_func(current_data);
      if (tick < max_ticks) {
        current_data = step_function(current_data);
        render_func(current_data);
        return setTimeout(pulse, delay);
      }
    };
    return pulse();
  };
  (function() {
    var DELAY, HEIGHT, MAX_TICKS, WIDTH, data_transform_function, initial_world, render_function;
    WIDTH = 50;
    HEIGHT = 40;
    MAX_TICKS = 800;
    DELAY = 5;
    initial_world = world(WIDTH, HEIGHT);
    seed_world(initial_world);
    render_function = display(WIDTH, HEIGHT).render_board;
    data_transform_function = board_transform_function(WIDTH, HEIGHT);
    return animate(initial_world, data_transform_function, render_function, DELAY, MAX_TICKS);
  })();
}).call(this);

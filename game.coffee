assert = (cond) -> 
  if !cond
    debugger
    throw("assertion error")

abstract_game_of_life = (world_factory, point_lives_next_gen) ->
  return (old_world) -> 
    new_world = world_factory()
    for cell in old_world.cells()
      is_alive = old_world.alive(cell)
      n = old_world.num_alive_neighbors(cell)
      fate = point_lives_next_gen(is_alive, n)
      new_world.set(cell, fate)
    new_world
 
do ->
  # test with a one-cell world first
  world_factory = ->
    cells = [false]
    obj =
      cells:
        -> [0]
      num_alive_neighbors:
        (i) -> 0
      alive:
        (i) -> cells[i]
      set:
        (i, fate) -> cells[0] = fate
      status:
        -> cells[0]
  toggle = (alive, n) -> !alive
  f = abstract_game_of_life(world_factory, toggle)
  w = world_factory()
  assert !w.status()
  w = f(w)
  assert w.status()
  w = f(w)
  assert !w.status()

      
point_lives_next_gen = (alive, n) ->
  if alive
    n in [2, 3]
  else
    n == 3

do ->
  assert point_lives_next_gen(true, 2)
  assert point_lives_next_gen(true, 3)
  assert point_lives_next_gen(false, 3)
  assert !point_lives_next_gen(false, 4)

data_2d = ->
  hash = {}
  key = (point) ->
    [x, y] = point
    "#{x},#{y}"
  obj =
    alive: (point) -> 
      hash[key(point)]
    set: (point, fate) ->
      hash[key(point)] = fate

do ->
  d = data_2d()
  assert !d.alive([5,7])
  d.set([5,7], true)
  assert d.alive([5,7])

get_toroidal_neighbors = (point, width, height) ->
  [x, y] = point
  x_deltas = [
    -1,  0,  1,
    -1,      1,
    -1,  0,  1
  ]
  y_deltas = [
    -1, -1, -1,
     0,      0,
     1,  1,  1
  ]

  x_deltas.map (dx, i) ->
    dy = y_deltas[i]
    xx = (x + dx + width) % width
    yy = (y + dy + height) % height
    [xx, yy]

do ->
  result = get_toroidal_neighbors([1,1], 10, 10)
  expected = [
    [0,0], [1,0], [2,0],
    [0,1],        [2,1],
    [0,2], [1,2], [2,2]
  ]
  assert(result.toString() == expected.toString())

world = (width, height) ->
  data = data_2d()
  cells = ->
    points = []
    for x in [0...width]
      for y in [0...height]
        points.push([x,y])
    points

  num_alive_neighbors = (loc) ->
    num = 0
    neighbors = get_toroidal_neighbors(loc, width, height)
    for n in neighbors
      num += 1 if data.alive(n)
    num

  obj =
    alive: data.alive
    set: data.set
    cells: cells
    num_alive_neighbors: num_alive_neighbors

do ->
  w = world(10, 10)
  assert(w.cells().length == 100)
  w.set([5,5], true)
  assert(w.alive([5,5]))
  assert(w.num_alive_neighbors([5,5]) == 0)
  w.set([5,6], true)
  assert(w.num_alive_neighbors([5,5]) == 1)
  w.set([6,6], true)
  assert(w.num_alive_neighbors([5,5]) == 2)
  # try to fool us with a far-off cell
  w.set([9,9], true)
  assert(w.num_alive_neighbors([5,5]) == 2)
  # kill thy neighbor
  w.set([6,6], false)
  assert(w.num_alive_neighbors([5,5]) == 1)


board_transform_function = (width, height) ->
  create_world = -> world(width, height)
  abstract_game_of_life(
    create_world,
    point_lives_next_gen)

do ->
  f = board_transform_function()
  w = world(10, 10)
  w.set([0,0], true)
  w.set([1,0], true)
  w.set([2,0], true)
  assert(w.alive([1,0]))
  assert(!w.alive([1,1]))
  w = f(w)
  assert(!w.alive([0,0]))
  assert(w.alive([1,0]))
  assert(w.alive([1,1]))

seed_coords = ->
  seed = [
    "X      ",
    "       ",
    "XX     ",
    "       ",
    "  XXX  ",
    "       ",
    "   XXX ",
    "    X  ",
  ]
  points = []
  for s, x in seed
    for y in [0...s.length]
      points.push([x,y]) if s.charAt(y) != ' '
  [x+5, y+5] for [x,y] in points

seed_world = (world) ->
  for coord in seed_coords()
    world.set(coord, true)

do ->
  w = world(20, 20)
  seed_world(w)
  assert(w.alive([5, 5]))
  assert(w.alive([7, 5]))
  assert(!w.alive([8, 5]))

view_2d = (width, height) ->
  canvas = document.getElementById("canvas")
  ctx = canvas.getContext("2d")

  draw: (x, y, fate) ->
    ctx.fillStyle = 
      if fate
        'black'
      else
        'white'
    w = 10
    h = 10
    x = x * w
    y = y * h
    ctx.fillRect(x, y, w, h)

display = (width, height) ->
  view = view_2d(width, height)
  render_board: (board) ->
    for x in [0...width]
      for y in [0...height]
        fate = board.alive([x, y])
        view.draw(x, y, fate)

animate = (initial_data, step_function, render_func, delay, max_ticks) ->
  tick = 0
  current_data = initial_data

  pulse = ->
    tick += 1
    render_func(current_data)
    if (tick < max_ticks)
      current_data = step_function(current_data)
      render_func(current_data)
      setTimeout(pulse, delay)
  pulse()

do -> 
  # CONFIGURATION
  WIDTH = 50
  HEIGHT = 40
  MAX_TICKS = 800
  DELAY = 5 # milliseconds

  initial_world = world(WIDTH, HEIGHT)
  seed_world(initial_world)
  render_function = display(WIDTH, HEIGHT).render_board
  data_transform_function = board_transform_function(WIDTH, HEIGHT)
  animate(
    initial_world,
    data_transform_function,
    render_function,
    DELAY,
    MAX_TICKS
  )


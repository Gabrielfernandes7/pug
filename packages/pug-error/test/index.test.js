const error = require('..');

describe('with a source', () => {
  test('and a filename', () => {
    const err = error('MY_CODE', 'My message', {
      line: 3,
      filename: 'myfile',
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'myfile:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe('myfile');
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
  test('and no filename', () => {
    const err = error('MY_CODE', 'My message', {
      line: 3,
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'Pug:3\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
});

describe('without source', () => {
  test('and with a filename', () => {
    const err = error('MY_CODE', 'My message', {line: 3, filename: 'myfile'});
    expect(err.message).toBe('myfile:3\n\nMy message');
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe('myfile');
    expect(err.src).toBe(undefined);
  });
  test('and with no filename', () => {
    const err = error('MY_CODE', 'My message', {line: 3});
    expect(err.message).toBe('Pug:3\n\nMy message');
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe(undefined);
  });
});

describe('with column', () => {
  test('and with a filename', () => {
    const err = error('MY_CODE', 'My message', {
      line: 3,
      column: 2,
      filename: 'myfile',
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'myfile:3:2\n    1| foo\n    2| bar\n  > 3| baz\n--------^\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe('myfile');
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
  test('and with no filename', () => {
    const err = error('MY_CODE', 'My message', {line: 3, column: 1});
    expect(err.message).toBe('Pug:3:1\n\nMy message');
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe(undefined);
  });
});

describe('invalid information', () => {
  test('negative column', () => {
    const err = error('MY_CODE', 'My message', {
      line: 3,
      column: -1,
      src: 'foo\nbar\nbaz\nbash\nbing',
    });
    expect(err.message).toBe(
      'Pug:3:-1\n    1| foo\n    2| bar\n  > 3| baz\n    4| bash\n    5| bing\n\nMy message'
    );
    expect(err.code).toBe('PUG:MY_CODE');
    expect(err.msg).toBe('My message');
    expect(err.line).toBe(3);
    expect(err.filename).toBe(undefined);
    expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
  });
  test('out of range line', () => {
    check(0);
    check(6);

    function check(line) {
      const err = error('MY_CODE', 'My message', {
        line,
        src: 'foo\nbar\nbaz\nbash\nbing',
      });
      expect(err.message).toBe(`Pug:${line}\n\nMy message`);
      expect(err.code).toBe('PUG:MY_CODE');
      expect(err.msg).toBe('My message');
      expect(err.line).toBe(line);
      expect(err.filename).toBe(undefined);
      expect(err.src).toBe('foo\nbar\nbaz\nbash\nbing');
    }
  });
});

const expect = require('expect');
const {generateMessage} = require('./message');

describe('Generating message', () => {
  it('Should generate correct message object', () => {
    var from = 'Ahmed';
    var text = 'some message';
    var message = generateMessage(from, text);

    //expect@1.20.2 => v1.20.2 to work right
    expect(message.createdAt).toBeA('number');
    expect(message).toInclude({from, text});
  });
})

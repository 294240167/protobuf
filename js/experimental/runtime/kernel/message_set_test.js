/**
 * @fileoverview Tests for indexer.js.
 */
goog.module('protobuf.runtime.MessageSetTest');

goog.setTestOnly();


const InternalMessage = goog.require('protobuf.binary.InternalMessage');
const Kernel = goog.require('protobuf.runtime.Kernel');
const MessageSet = goog.require('protobuf.runtime.MessageSet');

/**
 * @implements {InternalMessage}
 */
class KernelWrapper {
  constructor(kernel) {
    this.kernel = kernel;
  }

  /**
   * @return {!Kernel}
   * @override
   */
  internalGetKernel() {
    return this.kernel;
  }
}


/**
 * @param {...number} bytes
 * @return {!ArrayBuffer}
 */
function createArrayBuffer(...bytes) {
  return new Uint8Array(bytes).buffer;
}



describe('Optional MessageSet does', () => {
  it('encode as a field', () => {
    // message Bar {
    //  optional MessageSet mset = 10;
    //}
    //
    // message Foo {
    //  extend proto2.bridge.MessageSet {
    //    optional Foo message_set_extension = 12345;
    //  }
    //  optional int32 f20 = 20;
    //}

    const fooMessage = Kernel.createEmpty();
    fooMessage.setInt32(20, 30);

    const messageSet = MessageSet.createEmpty();

    const item = MessageSet.Item.create(12345, new KernelWrapper(fooMessage));

    messageSet.addItem(item);


    const barMessage = Kernel.createEmpty();
    barMessage.setMessage(10, messageSet);

    const arrayBuffer = barMessage.serialize();

    expect(arrayBuffer)
        .toEqual(createArrayBuffer(
            0x52,  // Tag (field:10, length delimited)
            0x0A,  // Length of 10 bytes
            0x0B,  // Start group fieldnumber 1
            0x10,  // Tag (field 2, varint)
            0xB9,  // 12345
            0x60,  // 12345
            0x1A,  // Tag (field 3, length delimited)
            0x03,  // length 3
            0xA0,  // Tag (fieldnumber 20, varint)
            0x01,  // Tag (fieldnumber 20, varint)
            0x1E,  // 30
            0x0C   // Stop Group field number 1
            ));
  });

  it('deserializes', () => {
    const fooMessage = Kernel.createEmpty();
    fooMessage.setInt32(20, 30);

    const messageSet = MessageSet.createEmpty();
    const item = MessageSet.Item.create(12345, new KernelWrapper(fooMessage));
    messageSet.addItem(item);


    const barMessage = Kernel.createEmpty();
    barMessage.setMessage(10, messageSet);

    const arrayBuffer = barMessage.serialize();

    const barMessageParsed = Kernel.fromArrayBuffer(arrayBuffer);
    expect(barMessageParsed.hasFieldNumber(10)).toBe(true);

    const messageSetParsed =
        barMessageParsed.getMessage(10, MessageSet.fromKernel);

    const [itemParsed] = messageSetParsed.getItems();

    expect(itemParsed.getTypeId()).toEqual(12345);

    const fooMessageParsed =
        itemParsed.getMessage(k => new KernelWrapper(k)).internalGetKernel();

    expect(fooMessageParsed.getInt32WithDefault(20)).toBe(30);
  });
});

describe('Repeated MessageSet does', () => {
  it('encode as a field', () => {
    // message Bar {
    //  optional MessageSet mset = 10;
    //}
    //
    // message Foo {
    //  extend proto2.bridge.MessageSet {
    //    repeated Foo message_set_extension = 12345;
    //  }
    //  optional int32 f20 = 20;
    //}

    const fooMessage1 = Kernel.createEmpty();
    fooMessage1.setInt32(20, 30);

    const messageSet = MessageSet.createEmpty();

    const item1 = MessageSet.Item.create(12345, new KernelWrapper(fooMessage1));

    messageSet.addItem(item1);

    const fooMessage2 = Kernel.createEmpty();
    fooMessage2.setInt32(20, 40);

    const item2 = MessageSet.Item.create(12345, new KernelWrapper(fooMessage2));
    messageSet.addItem(item2);


    const barMessage = Kernel.createEmpty();
    barMessage.setMessage(10, messageSet);

    const arrayBuffer = barMessage.serialize();

    expect(arrayBuffer)
        .toEqual(createArrayBuffer(
            0x52,  // Tag (field:10, length delimited)
            0x14,  // Length of 10 bytes
            0x0B,  // Start group fieldnumber 1
            0x10,  // Tag (field 2, varint)
            0xB9,  // 12345
            0x60,  // 12345
            0x1A,  // Tag (field 3, length delimited)
            0x03,  // length 3
            0xA0,  // Tag (fieldnumber 20, varint)
            0x01,  // Tag (fieldnumber 20, varint)
            0x1E,  // 30
            0x0C,  // Stop Group field number 1
            0x0B,  // Start group fieldnumber 1
            0x10,  // Tag (field 2, varint)
            0xB9,  // 12345
            0x60,  // 12345
            0x1A,  // Tag (field 3, length delimited)
            0x03,  // length 3
            0xA0,  // Tag (fieldnumber 20, varint)
            0x01,  // Tag (fieldnumber 20, varint)
            0x28,  // 40
            0x0C   // Stop Group field number 1
            ));
  });

  it('deserializes', () => {
    const fooMessage1 = Kernel.createEmpty();
    fooMessage1.setInt32(20, 30);

    const messageSet = MessageSet.createEmpty();
    const item1 = MessageSet.Item.create(12345, new KernelWrapper(fooMessage1));
    messageSet.addItem(item1);

    const fooMessage2 = Kernel.createEmpty();
    fooMessage2.setInt32(20, 40);
    const item2 = MessageSet.Item.create(12345, new KernelWrapper(fooMessage2));
    messageSet.addItem(item2);


    const barMessage = Kernel.createEmpty();
    barMessage.setMessage(10, messageSet);

    const arrayBuffer = barMessage.serialize();



    const barMessageParsed = Kernel.fromArrayBuffer(arrayBuffer);
    expect(barMessageParsed.hasFieldNumber(10)).toBe(true);

    const messageSetParsed =
        barMessageParsed.getMessage(10, MessageSet.fromKernel);

    const itemsParsed = Array.from(messageSetParsed.getItems());

    expect(itemsParsed.length).toBe(2);

    expect(itemsParsed[0].getTypeId()).toEqual(12345);
    expect(itemsParsed[1].getTypeId()).toEqual(12345);

    const fooMessageParsed1 = itemsParsed[0]
                                  .getMessage(k => new KernelWrapper(k))
                                  .internalGetKernel();

    expect(fooMessageParsed1.getInt32WithDefault(20)).toBe(30);

    const fooMessageParsed2 = itemsParsed[1]
                                  .getMessage(k => new KernelWrapper(k))
                                  .internalGetKernel();

    expect(fooMessageParsed2.getInt32WithDefault(20)).toBe(40);
  });
});

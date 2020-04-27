goog.module('protobuf.runtime.MessageSet');

const InternalMessage = goog.require('protobuf.binary.InternalMessage');
const Kernel = goog.require('protobuf.runtime.Kernel');

/**
 * @implements {InternalMessage}
 * @final
 */
class MessageSet {
  /**
   * @param {!Kernel} kernel
   * @return {!MessageSet}
   */
  static fromKernel(kernel) {
    return new MessageSet(kernel);
  }

  /**
   * @return {!MessageSet}
   */
  static createEmpty() {
    const kernel = Kernel.createEmpty();
    return MessageSet.fromKernel(kernel);
  }

  /**
   * @param {!Kernel} kernel
   * @private
   */
  constructor(kernel) {
    /** @const {!Kernel} @private */
    this.kernel_ = kernel;
  }

  /** @return {!Iterable<!MessageSet.Item>} */
  getItems() {
    return this.kernel_.getRepeatedGroupIterable(1, MessageSet.Item.fromKernel);
  }

  /**
   * @param {number} index
   * @return {!MessageSet.Item}
   */
  getItemElement(index) {
    return this.kernel_.getRepeatedGroupElement(
        1, MessageSet.Item.fromKernel, index);
  }

  /**
   * @return {number}
   */
  getItemCount() {
    return this.kernel_.getRepeatedGroupSize(1, MessageSet.Item.fromKernel);
  }

  /** @param {!MessageSet.Item} item */
  addItem(item) {
    this.kernel_.addRepeatedGroupElement(1, item, MessageSet.Item.fromKernel);
  }

  /** @param {!Iterable<!MessageSet.Item>} items */
  addItems(items) {
    this.kernel_.addRepeatedGroupIterable(1, items, MessageSet.Item.fromKernel);
  }

  /** @param {!Iterable<!MessageSet.Item>} items */
  setItems(items) {
    this.kernel_.setRepeatedGroupIterable(1, items);
  }

  // code helpers for code gen
  /**
   * @param {number} typeId
   * @return {?T}
   * @template T
   */
  hasMessage(typeId) {
    for (let item of this.getItems()) {
      if (item.getTypeId() === typeId) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {number} typeId
   * @param {function(!Kernel):T} instanceCreator
   * @param {number=} pivot
   * @return {?T}
   * @template T
   */
  getMessageOrNull(typeId, instanceCreator, pivot) {
    let message = null;
    // Must let the last occurance with typeId be used, not first.
    for (let item of this.getItems()) {
      if (item.getTypeId() === typeId) {
        message = item.getMessage(instanceCreator, pivot);
      }
    }
    return message;
  }

  /**
   * @param {number} typeId
   * @return {?Kernel}
   */
  getMessageAccessorOrNull(typeId) {
    const array = this.getMessageAccessors(typeId);
    return array.length > 0 ? array[array.length - 1] : null;
  }

  /**
   * @param {number} typeId
   * @param {function(!Kernel):T} instanceCreator
   * @param {number=} pivot
   * @return {T}
   * @template T
   */
  getMessageAttach(typeId, instanceCreator, pivot) {
    let message = this.getMessageOrNull(typeId, instanceCreator, pivot);
    if (message) {
      return message;
    }

    message = instanceCreator(Kernel.createEmpty());
    const item = MessageSet.Item.create(typeId, message);
    this.addItem(item);
    return message;
  }

  /**
   * @param {number} typeId
   * @return {!Array<!Kernel>}
   */
  getMessageAccessors(typeId) {
    /** @type {!Array<!Kernel>} */
    let items = [];
    for (let item of this.getItems()) {
      if (item.getTypeId() === typeId) {
        const accessor = item.getMessageAccessorOrNull();
        if (accessor) {
          items.push(accessor);
        }
      }
    }
    return items;
  }

  /**
   * @param {number} typeId
   * @param {?InternalMessage} message
   */
  setItem(typeId, message) {
    const /** !Array<!MessageSet.Item> */ items = [];
    // Filter out any existing items with matching typeId.
    for (const item of this.getItems()) {
      if (item.getTypeId() != typeId) {
        items.push(item);
      }
    }
    if (message) {
      items.push(MessageSet.Item.create(typeId, message));
    }
    this.setItems(items);
  }

  /**
   * @return {!Kernel}
   * @override
   */
  internalGetKernel() {
    return this.kernel_;
  }
}

/**
 * @implements {InternalMessage}
 * @final
 */
MessageSet.Item = class {
  /**
   * @param {number} typeId
   * @param {!InternalMessage} value
   * @return {!MessageSet.Item}
   */
  static create(typeId, value) {
    const kernel = Kernel.createEmpty();
    kernel.setInt32(2, typeId);
    kernel.setMessage(3, value);
    return new MessageSet.Item(kernel);
  }

  /**
   * @param {!Kernel} kernel
   * @return {!MessageSet.Item}
   */
  static fromKernel(kernel) {
    return new MessageSet.Item(kernel);
  }

  /**
   * @param {!Kernel} kernel
   * @private
   */
  constructor(kernel) {
    /** @const {!Kernel} @private */
    this.kernel_ = kernel;
  }

  /**
   * @param {function(!Kernel):T} instanceCreator
   * @param {number=} pivot
   * @return {T}
   * @template T
   */
  getMessage(instanceCreator, pivot) {
    return this.kernel_.getMessage(3, instanceCreator, pivot);
  }

  /**
   * @param {function(!Kernel):T} instanceCreator
   * @param {number=} pivot
   * @return {T}
   * @template T
   */
  getMessageAttach(instanceCreator, pivot) {
    return this.kernel_.getMessageAttach(3, instanceCreator, pivot);
  }

  /**
   * @param {number=} pivot
   * @return {?Kernel}
   */
  getMessageAccessorOrNull(pivot) {
    return this.kernel_.getMessageAccessorOrNull(3, pivot);
  }

  /**
   * @param {!InternalMessage} value
   */
  setMessage(value) {
    this.kernel_.setMessage(3, value);
  }

  /** @return {number} */
  getTypeId() {
    return this.kernel_.getInt32WithDefault(2);
  }

  /**
   * @return {!Kernel}
   * @override
   */
  internalGetKernel() {
    return this.kernel_;
  }
};

exports = MessageSet;

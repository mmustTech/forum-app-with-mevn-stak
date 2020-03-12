const factory = require('./handlerFactory');
const Topic = require('../models/topicModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getTopicWithIncViews = catchAsync(async (req, res, next) => {
  let query = Topic.findById(req.params.id);
  // if (popOptions) query = query.populate(popOptions);

  const doc = await query;

  if (!doc) {
    return next(new AppError('no document found with this ID', 404));
  }

  await Topic.findByIdAndUpdate(
    doc.id,
    { $inc: { views: 1} } // }, 
  )

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  });
});

exports.getAllTopics = factory.getAll(Topic);
exports.createTopic = factory.createOne(Topic);

exports.getTopic = factory.getOne(Topic);
exports.updateTopic = factory.updateOne(Topic);
exports.deleteTopic = factory.deleteOne(Topic);
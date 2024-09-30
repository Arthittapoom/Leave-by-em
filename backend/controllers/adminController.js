const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const AdminsModel = require('../models/admins.js');
const moment = require('moment');

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
  
};

exports.setIsActive = catchAsync(async (req, res, next) => {
  try {
    if (!req.body.id || req.body.is_active == null) {
      return next(new AppError("Bad Request", 400));
    }

    console.log('request body: ', req.body)
    const isActive = req.body.is_active ? 1 : 0;
    const body = {
      is_active: isActive,
      updated_by: req.user.username,
      updated_date: new Date()
    };

    const query = {
      _id: req.body.id
    };

    const result = await AdminsModel.findOneAndUpdate(query, body, { new: true });
    if (result) {
      res.status(200).json({ status: 'updated success', date: result });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.getUser = catchAsync(async (req, res, next) => {
  try {
    const result = await AdminsModel.findOne({ _id: req.params.id });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

exports.getDataPaginate = catchAsync(async (req, res, next) => {
  try {
    const pageSize = parseInt(req.query.perPage) || 10;
    const pageNum = parseInt(req.query.nowPage) || 1;

    let matchQuery = {};
    if (req.user.role === 3) {
      matchQuery._id = req.user._id;
    } else if (req.user.role === 2) {
      matchQuery.role = { $ne: 1 };
    }

    const pipeline = [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: 'mas_role',
          localField: 'role',
          foreignField: '_id',
          as: 'rolename'
        }
      },
      {
        $unwind: '$rolename'
      },
      {
        $facet: {
          data: [
            { $skip: (pageNum - 1) * pageSize },
            { $limit: pageSize }
          ],
          totalCount: [
            { $count: "total" }
          ]
        }
      },
      {
        $unwind: "$totalCount"
      },
      {
        $project: {
          data: 1,
          total: "$totalCount.total"
        }
      }
    ];

    const result = await AdminsModel.aggregate(pipeline);
    res.status(200).json({
      status: 'success',
      data: result[0].data,
      totalDocs: result[0].total,
      totalPages: Math.ceil(result[0].total / pageSize),
      currentPage: pageNum
    });
  } catch (err) {
    next(err);
  }
});

exports.createAdmin = catchAsync(async (req, res, next) => {
  try {
    const { id, username, password, fullname, email, phone, role, fk_user_id } = req.body;
    if (!id || !fk_user_id || !username || !password || !fullname || !role) {
      return next(new AppError("Bad Request", 400));
    }
    let body = {
      username: username,
      password: await bcrypt.hash(password, 12),
      fullname: fullname,
      email: email || '',
      phone: phone || '',
      role: role,
      fk_user_id: fk_user_id,
      created_by: id,
      created_date: new Date(),
      updated_by: id,
      updated_date: new Date()
    };

    var result = await AdminsModel.create(body);
    if (result) {
      res.status(201).json({ status: 'created success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.updateAdmin = catchAsync(async (req, res, next) => {
  try {

    if (!req.body.fk_user_id || !req.body.id) {
      return next(new AppError("Bad Request", 400));
    }
    const result_out = await AdminsModel.findById(req.user.id);

    const body = {
      fullname: req.body.fullname || result_out.fullname,
      email: req.body.email || result_out.email,
      phone: req.body.phone || result_out.phone,
      role: req.body.role || result_out.role,
      fk_user_id: req.body.fk_user_id || result_out.fk_user_id,
      updated_by: req.user.id,
      updated_date: new Date().toISOString()
    };

    if (req.body.password) {
      body.password = await bcrypt.hash(req.body.password, 12);
    }

    const result = await AdminsModel.updateOne({ _id: req.params.id }, { $set: body }, { new: true });

    if (result) {
      res.status(200).json({ status: 'updated success' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

exports.deleteAdmin = catchAsync(async (req, res, next) => {
  try {
    const body = {
      is_delete: 1,
      updated_by: req.user.id,
      updated_date: new Date().toISOString()
    };
    const result = await AdminsModel.findByIdAndUpdate({ _id: req.params.id }, { $set: body }, { new: true });
    if (result) {
      res.status(200).json({ status: 'updated success' });
    } else {
      res.status(404).json({ status: 'admin not found' });
    }
  }
  catch (err) {
    return next(new AppError("ERROR: " + err, 400));
  }
});

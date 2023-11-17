import userServices from '../services/user.services.js';

export default {
  filterCustomer: async (req, res, next) => {
    try {
      const { searchValue } = req.query;
      const data = await userServices.filterCustomer(searchValue);
      res.status(200).json({
        status: 200,
        message: 'filter customer success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  getAllUser: async (req, res, next) => {
    try {
      const userResults = await userServices.getAllUser();
      res.status(200).json({
        status: 200,
        message: 'get all user success',
        data: userResults,
      });
    } catch (err) {
      next(err);
    }
  },

  getUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = await userServices.getUserInfo(id);
      res.status(200).json({
        status: 200,
        message: 'get user infomation success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      await userServices.deleteUserById(id);
      res.status(200).json({
        status: 200,
        message: 'deleted user success',
      });
    } catch (err) {
      next(err);
    }
  },

  editUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userInvo = req.body;

      //   edit user
      const data = await userServices.editUserById(id, userInvo);

      res.status(200).json({
        status: 200,
        message: 'updated user infomation success',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  changeRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      await userServices.updateRoleById(id, role);
      res.status(200).json({
        status: 200,
        message: 'update role for account success',
      });
    } catch (err) {
      next(err);
    }
  },

  changePermit: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { permitList } = req.body;
      await userServices.updatePermitById(id, permitList);
      res.status(200).json({
        status: 200,
        message: 'update permit for account success',
      });
    } catch (err) {
      next(err);
    }
  },

  createAccountAndSendMail: async (req, res, next) => {
    try {
      const { email, name, fullName, address, dateOfBirth, phoneNumber, role } = req.body;
      const dataInvo = { email, name, fullName, address, dateOfBirth, phoneNumber, role };
      const data = await userServices.createAccountAndSendMail(dataInvo);
      res.status(201).json({
        status: 201,
        message: 'create new account success!',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

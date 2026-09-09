import Department from '../models/Department.js';

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const { name, description, head } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required',
      });
    }

    const department = await Department.create({
      name,
      description,
      head,
    });

    res.status(201).json({
      success: true,
      data: department,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Department name already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { name, description, head, isActive } = req.body;

    let department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    if (name) department.name = name;
    if (description) department.description = description;
    if (head) department.head = head;
    if (isActive !== undefined) department.isActive = isActive;

    department.updatedAt = Date.now();
    await department.save();

    res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

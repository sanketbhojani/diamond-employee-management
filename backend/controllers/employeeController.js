const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { recalculateChutakEmployeeSalary } = require('../utils/salaryCalculator');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res) => {
  try {
    const { search, department, subDepartment } = req.query;
    
    let query = { isActive: true };
    
    if (department) {
      query.department = department;
    }
    
    if (subDepartment) {
      query.subDepartment = subDepartment;
    }
    
    if (search) {
      query.$or = [
        { employeeId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    // Recalculate salaries for Chutak employees to include daily salary totals
    const employeesWithUpdatedSalaries = await Promise.all(
      employees.map(async (emp) => {
        const empObj = emp.toObject ? emp.toObject() : emp;
        if (empObj.employeeType === 'Chutak') {
          const calculated = await recalculateChutakEmployeeSalary(emp);
          // Update the employee object with calculated values
          empObj.grossSalary = calculated.grossSalary;
          empObj.netSalary = calculated.netSalary;
          // Update in database as well
          await Employee.findByIdAndUpdate(
            emp._id,
            {
              grossSalary: calculated.grossSalary,
              netSalary: calculated.netSalary
            },
            { runValidators: false }
          );
        }
        return empObj;
      })
    );

    res.json({
      success: true,
      count: employeesWithUpdatedSalaries.length,
      employees: employeesWithUpdatedSalaries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('department', 'name');
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Recalculate salary for Chutak employees
    let employeeObj = employee.toObject ? employee.toObject() : employee;
    if (employeeObj.employeeType === 'Chutak') {
      const calculated = await recalculateChutakEmployeeSalary(employee);
      employeeObj.grossSalary = calculated.grossSalary;
      employeeObj.netSalary = calculated.netSalary;
      // Update in database
      await Employee.findByIdAndUpdate(
        employee._id,
        {
          grossSalary: calculated.grossSalary,
          netSalary: calculated.netSalary
        },
        { runValidators: false }
      );
    }

    res.json({
      success: true,
      employee: employeeObj
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create employee
// @route   POST /api/employees
// @access  Private
exports.createEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Check if employee ID already exists
    const existingEmployee = await Employee.findOne({ employeeId: employeeData.employeeId });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee ID already exists' });
    }

    // Check if email already exists
    const existingEmail = await Employee.findOne({ email: employeeData.email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Calculate net salary
    if (employeeData.salary && employeeData.advancedSalary !== undefined) {
      const deductions = (employeeData.advancedSalary || 0) + (employeeData.pf || 0) + (employeeData.pt || 0);
      employeeData.netSalary = employeeData.salary - deductions;
      employeeData.grossSalary = employeeData.salary;
    }

    const employee = await Employee.create(employeeData);

    // Add employee to sub-department
    if (employee.department && employee.subDepartment) {
      const department = await Department.findById(employee.department);
      if (department) {
        const subDept = department.subDepartments.find(sub => sub.name === employee.subDepartment);
        if (subDept) {
          subDept.employees.push(employee._id);
          await department.save();
        }
      }
    }

    res.status(201).json({
      success: true,
      employee
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
exports.updateEmployee = async (req, res) => {
  try {
    const employeeData = req.body;

    // Calculate net salary
    if (employeeData.salary && employeeData.advancedSalary !== undefined) {
      const deductions = (employeeData.advancedSalary || 0) + (employeeData.pf || 0) + (employeeData.pt || 0);
      employeeData.netSalary = employeeData.salary - deductions;
      employeeData.grossSalary = employeeData.salary;
    }

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      employeeData,
      { new: true, runValidators: true }
    )
      .populate('department', 'name');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Soft delete
    employee.isActive = false;
    await employee.save();

    // Remove from sub-department
    if (employee.department && employee.subDepartment) {
      const department = await Department.findById(employee.department);
      if (department) {
        const subDept = department.subDepartments.find(sub => sub.name === employee.subDepartment);
        if (subDept) {
          subDept.employees.pull(employee._id);
          await department.save();
        }
      }
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get employees by department
// @route   GET /api/employees/department/:departmentId
// @access  Private
exports.getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.find({
      department: req.params.departmentId,
      isActive: true
    })
      .populate('department', 'name');

    // Recalculate salaries for Chutak employees
    const employeesWithUpdatedSalaries = await Promise.all(
      employees.map(async (emp) => {
        const empObj = emp.toObject ? emp.toObject() : emp;
        if (empObj.employeeType === 'Chutak') {
          const calculated = await recalculateChutakEmployeeSalary(emp);
          empObj.grossSalary = calculated.grossSalary;
          empObj.netSalary = calculated.netSalary;
          // Update in database
          await Employee.findByIdAndUpdate(
            emp._id,
            {
              grossSalary: calculated.grossSalary,
              netSalary: calculated.netSalary
            },
            { runValidators: false }
          );
        }
        return empObj;
      })
    );

    res.json({
      success: true,
      count: employeesWithUpdatedSalaries.length,
      employees: employeesWithUpdatedSalaries
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Assign employee to sub-department
// @route   PUT /api/employees/:id/assign
// @access  Private
exports.assignEmployeeToSubDepartment = async (req, res) => {
  try {
    const { subDepartment } = req.body;
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Remove from old sub-department
    if (employee.department && employee.subDepartment) {
      const oldDepartment = await Department.findById(employee.department);
      if (oldDepartment) {
        const oldSubDept = oldDepartment.subDepartments.find(sub => sub.name === employee.subDepartment);
        if (oldSubDept) {
          oldSubDept.employees.pull(employee._id);
          await oldDepartment.save();
        }
      }
    }

    // Add to new sub-department
    employee.subDepartment = subDepartment;
    await employee.save();

    if (employee.department && subDepartment) {
      const department = await Department.findById(employee.department);
      if (department) {
        const subDept = department.subDepartments.find(sub => sub.name === subDepartment);
        if (subDept) {
          subDept.employees.push(employee._id);
          await department.save();
        }
      }
    }

    res.json({
      success: true,
      employee
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


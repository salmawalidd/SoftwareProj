import supabase from "../config/db.js";

export const getWorkers = async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Access denied. Managers only.",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("role", "worker");

    if (error) {
      return res.status(500).json({
        message: error.message,
      });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
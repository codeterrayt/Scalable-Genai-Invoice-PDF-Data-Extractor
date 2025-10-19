const { z } = require("zod");
const { FILE_STATUS_ARRAY } = require("../consts/const");

const getFilesQuerySchema = z.object({
    flag: z.boolean().optional(),
    status: z.enum(FILE_STATUS_ARRAY).optional(),
});
  
module.exports = { getFilesQuerySchema };

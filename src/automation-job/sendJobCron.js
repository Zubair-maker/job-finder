import cron from "node-cron";
import { Job } from "../model/jobModel.js";
import { User } from "../model/userModel.js";
import { sendJobEmail } from "../utils/sendJobEmail.js";

export const sendJobCrone = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running Cron Automation");

    try {
      // Fetch jobs that need newsletters sent
      const jobs = await Job.find({ newsLetterSent: false });
      console.log("job-cron", jobs);
      if (!jobs.length) return;

      for (const job of jobs) {
        // Fetch users that match the job's skill
        const filteredUsers = await User.find({
          $or: [
            { "skills.firstSkill": job.jobSkill },
            { "skills.secondSkill": job.jobSkill },
            { "skills.thirdSkill": job.jobSkill },
          ],
        });

        for (const user of filteredUsers) {
          const subject = `Exciting Job Opportunity: ${job.title} at ${job.companyName} – Apply Now!`;
          const message = `
            Hi ${user.name},
            We are thrilled to inform you about a job opportunity that matches your interests.
            A new **${job.title}** role has just opened up at **${job.companyName}**, and we think it could be a great fit for you!

            **Position Overview:**
            - **Job Title:** ${job.title}
            - **Company:** ${job.companyName}
            - **Location:** ${job.location}
            - **Salary Range:** ${job.salary}
            - **Job Type:** ${job.jobType}


            **Best Regards,**  
            The NicheNest Team  
          `;

          // Await the sendJobEmail promise
          await sendJobEmail({
            email: user.email,
            subject,
            message,
          });
        }

        // Mark the job as newsletter sent
        job.newsLetterSent = true;
        await job.save();
      }
    } catch (error) {
      console.error("ERROR IN NODE CRON CATCH BLOCK:", error);  
    }
  });
};

import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import NavBar from "~/components/NavBar"
import { prepareInstructions } from "~/constants";
import { convertPdfToImage } from "~/lib/pdf2img";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utilities";

const upload = () => {
    const { fs, kv, ai, isLoading, auth } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("Processing your resume...");
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/upload`);
    }, [isLoading])

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyse = async (
        { companyName, jobTitle, jobDescription, file }
            :
            { companyName: string, jobTitle: string, jobDescription: string, file: File }
    ) => {
        setIsProcessing(true);

        setStatusText("Uploading your resume file...");
        const uploadedFile = await fs.upload([file]);
        if (!uploadedFile) return setStatusText("Failed to upload file. Please try again.");

        setStatusText("Converting file to image...");
        const imageFile = await convertPdfToImage(file);
        if (!imageFile.file) return setStatusText("Failed to convert PDF to image. Please try again.");

        setStatusText("Uploading your image...");
        const uploadedImage = await fs.upload([imageFile.file]);
        if (!uploadedImage) return setStatusText("Failed to upload image. Please try again.");

        setStatusText("Analyzing your resume...");
        const uuid = generateUUID();
        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,
            jobTitle,
            jobDescription,
            feedback: ''
        };

        await kv.set(`resume:${uuid}`, JSON.stringify(data));

        const feedback = await ai.feedback(uploadedFile.path, prepareInstructions({ jobTitle, jobDescription }));
        if (!feedback) return setStatusText("Failed to analyze resume. Please try again.");

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content
            : feedback.message.content[0].text;

        data.feedback = JSON.parse(feedbackText);
        await kv.set(`resume:${uuid}`, JSON.stringify(data));
        setStatusText("Analysis complete! Redirecting to results...");
        navigate(`/resume/${uuid}`);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) return;

        handleAnalyse({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <NavBar />

            <section className="main-section">
                <div className="page-heading">
                    <h1>Get perfect feedback for your resumes</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ) : (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                                <div className="form-div">
                                    <label htmlFor="company-name">Company Name</label>
                                    <input type="text" name="company-name" placeholder="Company Name"
                                        id="company-name" />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-title">Job Title</label>
                                    <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                                </div>
                                <div className="form-div">
                                    <label htmlFor="job-description">Job Description</label>
                                    <textarea rows={5} name="job-description" placeholder="Job Description"
                                        id="job-description" />
                                </div>

                                <div className="form-div">
                                    <label htmlFor="uploader">Upload Resume</label>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </div>

                                <button className="primary-button" type="submit">
                                    Analyze Resume
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}

export default upload
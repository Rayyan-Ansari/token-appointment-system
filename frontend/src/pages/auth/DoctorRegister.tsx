import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export const DoctorRegister: React.FC = () => {
    const navigate = useNavigate();
    const { registerDoctor } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
        dob: '',
        sex: 'M' as 'M' | 'F' | 'O',
        qualification: '',
        specialization: '',
        yearsExperience: 0,
        licenseNumber: '',
    });
    const [licenseDocument, setLicenseDocument] = useState<File | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLicenseDocument(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (!licenseDocument) {
            alert('Please upload your license document');
            return;
        }

        setIsLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            await registerDoctor({ ...registerData, licenseDocument });
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        👩‍⚕️ Doctor Registration
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">Create your doctor account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input
                            type="text"
                            name="fullName"
                            label="Full Name"
                            placeholder="Dr. Jane Smith"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="email"
                            name="email"
                            label="Email"
                            placeholder="doctor@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="tel"
                            name="phone"
                            label="Phone Number"
                            placeholder="+1234567890"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="date"
                            name="dob"
                            label="Date of Birth"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Sex
                            </label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                            >
                                <option value="M">Male</option>
                                <option value="F">Female</option>
                                <option value="O">Other</option>
                            </select>
                        </div>

                        <Input
                            type="text"
                            name="qualification"
                            label="Qualification"
                            placeholder="MBBS, MD"
                            value={formData.qualification}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="text"
                            name="specialization"
                            label="Specialization"
                            placeholder="Cardiology"
                            value={formData.specialization}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="number"
                            name="yearsExperience"
                            label="Years of Experience"
                            placeholder="5"
                            value={formData.yearsExperience}
                            onChange={handleChange}
                            required
                            min="0"
                        />

                        <Input
                            type="text"
                            name="licenseNumber"
                            label="License Number"
                            placeholder="MED123456"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            required
                        />

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                License Document (PDF, JPG, PNG)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                                required
                            />
                        </div>

                        <Input
                            type="password"
                            name="password"
                            label="Password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            type="password"
                            name="confirmPassword"
                            label="Confirm Password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>Note:</strong> Your account will be pending approval by an admin after registration.
                        </p>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Create Account
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                            Sign in
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

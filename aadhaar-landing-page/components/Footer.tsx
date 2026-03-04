import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-govt-blue text-white border-t-4 border-govt-green">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              {/* Added brightness-0 invert to make the emblem pure white */}
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-12 w-auto brightness-0 invert" />
              <div>
                <p className="font-bold text-lg">Unique Identification Authority of India</p>
                <p className="text-xs text-blue-200">Government of India</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed max-w-sm">
              Building a digital platform to empower residents of India with a unique identity and a digital platform to authenticate anytime, anywhere.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-base mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><a href="#" className="hover:text-white transition-colors">Aadhaar Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Grievance Redressal</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Locate Enrollment Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tenders & Vacancies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-base mb-4 text-white">Legal & Policy</h4>
            <ul className="space-y-2 text-sm text-blue-200">
              <li><a href="#" className="hover:text-white transition-colors">Aadhaar Act 2016</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Website Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-blue-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-blue-300">
          <p>© 2026 Unique Identification Authority of India. All Rights Reserved.</p>
          <p className="mt-2 md:mt-0">Last Updated: January 10, 2026</p>
        </div>
      </div>
    </footer>
  );
};